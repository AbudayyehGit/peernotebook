/**
 * Peer Notebook - Sprint 2: Offline-First Synchronization Queue (SP2-01)
 * High-resilience queue handler with retry backoff, granular UI conflict-resolution hooks,
 * and robust handling of dropped connectivity.
 *
 * Attribution: H. Joe Abudayyeh & Peer Notebook LLC (2026-2027)
 */

import { peerNotebookDB, dexieDB, SessionNote, SyncQueueItem } from '../db/peerNotebookDatabase';

export type QueueItemStatus =
  | 'pending'
  | 'in_progress'
  | 'retry_scheduled'
  | 'conflict_detected'
  | 'resolved'
  | 'synced'
  | 'failed';

export type ConflictResolutionStrategy =
  | 'field_author_wins'       // Last-write-wins prioritizing field peer specialist documentation
  | 'supervisor_cosign_merge'  // Merges supervisor signature/approval while retaining local notes
  | 'remote_overwrites'        // Accepts remote/server state unconditionally
  | 'manual_user_selection';   // Custom merge supplied by specialist via UI

export interface ConflictRecord<T = unknown> {
  queueItemId: string;
  entityType: 'session_note' | 'client' | 'audit_log';
  entityId: string;
  localPayload: T;
  remotePayload: T;
  detectedAt: string;
  conflictFields: string[];
  resolvedAt?: string;
  resolvedPayload?: T;
  resolutionStrategy?: ConflictResolutionStrategy;
}

export interface SyncQueueItemExtended extends Omit<SyncQueueItem, 'status'> {
  status: QueueItemStatus;
  lastAttemptAt?: string;
  nextRetryAt?: string;
  errorMessage?: string;
  conflictDetails?: ConflictRecord;
}

export interface QueueStateSummary {
  total: number;
  pending: number;
  inProgress: number;
  retryScheduled: number;
  conflicts: number;
  failed: number;
  synced: number;
  isOnline: boolean;
  isProcessing: boolean;
}

export type QueueListener = (summary: QueueStateSummary) => void;
export type ConflictListener = (conflict: ConflictRecord) => void;

export class SyncQueueManager {
  private isProcessing = false;
  private isOnline: boolean = typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean' ? navigator.onLine : true;
  private maxRetries = 5;
  private baseBackoffMs = 1000;
  private maxBackoffMs = 30000;
  private retryTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();
  private inMemoryQueue: Map<string, SyncQueueItemExtended> = new Map();
  private conflicts: Map<string, ConflictRecord> = new Map();
  private queueListeners: Set<QueueListener> = new Set();
  private conflictListeners: Set<ConflictListener> = new Set();
  private boundOnlineHandler: () => void;
  private boundOfflineHandler: () => void;

  constructor() {
    this.boundOnlineHandler = () => this.handleNetworkStateChange(true);
    this.boundOfflineHandler = () => this.handleNetworkStateChange(false);

    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.boundOnlineHandler);
      window.addEventListener('offline', this.boundOfflineHandler);
    }

    if (typeof indexedDB !== 'undefined') {
      void this.rehydrateQueueFromDexie();
    }
  }

  /**
   * Rehydrates queue state from Dexie IndexedDB
   */
  public async rehydrateQueueFromDexie(): Promise<void> {
    try {
      const items = await peerNotebookDB.getSyncQueue();
      for (const item of items) {
        if (!this.inMemoryQueue.has(item.id)) {
          this.inMemoryQueue.set(item.id, {
            ...item,
            status: (item.status as QueueItemStatus) || 'pending'
          });
        }
      }
      this.notifyQueueChange();
    } catch (err) {
      console.warn('[SyncQueue] Failed to rehydrate from Dexie:', err);
    }
  }

  /**
   * Enqueues a new sync mutation item
   */
  public async enqueue(
    operation: SyncQueueItem['operation'],
    entityType: SyncQueueItem['entityType'],
    entityId: string,
    payload: unknown
  ): Promise<SyncQueueItemExtended> {
    const item: SyncQueueItemExtended = {
      id: `sync_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      operation,
      entityType,
      entityId,
      payload,
      enqueuedAt: new Date().toISOString(),
      retryCount: 0,
      status: 'pending'
    };

    this.inMemoryQueue.set(item.id, item);

    // Persist to Dexie if indexedDB is available
    if (typeof indexedDB !== 'undefined') {
      try {
        await peerNotebookDB.addToSyncQueue({
          id: item.id,
          operation: item.operation,
          entityType: item.entityType,
          entityId: item.entityId,
          payload: item.payload,
          enqueuedAt: item.enqueuedAt,
          retryCount: item.retryCount,
          status: 'pending'
        });
      } catch (err) {
        console.warn('[SyncQueue] Failed to persist to Dexie sync_queue:', err);
      }
    }

    this.notifyQueueChange();

    // Trigger process if online
    if (this.isOnline && !this.isProcessing) {
      void this.processQueue();
    }

    return item;
  }

  /**
   * Calculates exponential backoff with jitter
   */
  public calculateBackoff(retryCount: number): number {
    const exponential = Math.min(this.maxBackoffMs, this.baseBackoffMs * Math.pow(2, retryCount));
    // Apply +/- 20% jitter to prevent thundering herd
    const jitter = exponential * 0.2 * (Math.random() * 2 - 1);
    return Math.max(500, Math.floor(exponential + jitter));
  }

  /**
   * Handles network connectivity transitions
   */
  public handleNetworkStateChange(online: boolean): void {
    this.isOnline = online;
    if (online) {
      // Clear any pending individual retry timeouts and execute immediate batch flush
      this.retryTimers.forEach((timer) => clearTimeout(timer));
      this.retryTimers.clear();
      void this.processQueue();
    } else {
      // Mark all in_progress items back to retry_scheduled or pending
      this.inMemoryQueue.forEach((item) => {
        if (item.status === 'in_progress') {
          item.status = 'retry_scheduled';
        }
      });
    }
    this.notifyQueueChange();
  }

  /**
   * Main Queue Processing Loop
   */
  public async processQueue(): Promise<void> {
    if (this.isProcessing || !this.isOnline) {
      return;
    }

    this.isProcessing = true;
    this.notifyQueueChange();

    try {
      const pendingItems = Array.from(this.inMemoryQueue.values()).filter(
        (i) => i.status === 'pending' || i.status === 'retry_scheduled'
      );

      for (const item of pendingItems) {
        if (!this.isOnline) {
          item.status = 'retry_scheduled';
          break;
        }

        item.status = 'in_progress';
        item.lastAttemptAt = new Date().toISOString();
        this.notifyQueueChange();

        try {
          await this.syncItemToStorage(item);
          item.status = 'synced';
          this.inMemoryQueue.delete(item.id);

          // Remove from Dexie sync_queue
          try {
            await dexieDB.sync_queue.delete(item.id);
          } catch {
            // Non-blocking
          }
        } catch (error: unknown) {
          const err = error as Error;

          // Check if error is a revision divergence / concurrency conflict
          if (err.message && err.message.includes('CONFLICT')) {
            this.handleDetectedConflict(item, (err as { remoteData?: unknown }).remoteData);
          } else {
            this.handleItemFailure(item, err.message || 'Sync failed');
          }
        }
      }
    } finally {
      this.isProcessing = false;
      this.notifyQueueChange();
    }
  }

  /**
   * Handles detected conflict between local and remote versions
   */
  public handleDetectedConflict(item: SyncQueueItemExtended, remoteData: unknown): void {
    item.status = 'conflict_detected';

    const localPayload = item.payload as Record<string, unknown>;
    const remotePayload = (remoteData as Record<string, unknown>) || {};

    // Identify changed fields
    const conflictFields: string[] = [];
    if (localPayload && typeof localPayload === 'object' && remotePayload && typeof remotePayload === 'object') {
      const keys = new Set([...Object.keys(localPayload), ...Object.keys(remotePayload)]);
      keys.forEach((key) => {
        if (JSON.stringify(localPayload[key]) !== JSON.stringify(remotePayload[key])) {
          conflictFields.push(key);
        }
      });
    }

    const conflictRecord: ConflictRecord = {
      queueItemId: item.id,
      entityType: item.entityType,
      entityId: item.entityId,
      localPayload: item.payload,
      remotePayload,
      detectedAt: new Date().toISOString(),
      conflictFields
    };

    item.conflictDetails = conflictRecord;
    this.conflicts.set(item.id, conflictRecord);

    // Notify conflict subscribers (e.g., UI modals, conflict notification badges)
    this.conflictListeners.forEach((fn) => fn(conflictRecord));
    this.notifyQueueChange();
  }

  /**
   * Resolves a detected conflict using the specified strategy
   */
  public async resolveConflict(
    queueItemId: string,
    strategy: ConflictResolutionStrategy,
    customMergedData?: unknown
  ): Promise<boolean> {
    const item = this.inMemoryQueue.get(queueItemId);
    const conflict = this.conflicts.get(queueItemId);

    if (!item || !conflict) {
      return false;
    }

    let resolvedPayload: unknown = null;
    const local = conflict.localPayload as Record<string, unknown>;
    const remote = conflict.remotePayload as Record<string, unknown>;

    switch (strategy) {
      case 'field_author_wins':
        // Last-Write-Wins: field specialist documentation dominates
        resolvedPayload = {
          ...remote,
          ...local,
          updatedAt: new Date().toISOString(),
          conflictResolution: 'field_author_wins'
        };
        break;

      case 'supervisor_cosign_merge':
        // Merges supervisor signature/approval while retaining local notes
        resolvedPayload = {
          ...local,
          status: remote.status || local.status,
          supervisorSignature: remote.supervisorSignature || local.supervisorSignature,
          supervisorApprovedAt: remote.supervisorApprovedAt || local.supervisorApprovedAt,
          updatedAt: new Date().toISOString(),
          conflictResolution: 'supervisor_cosign_merge'
        };
        break;

      case 'remote_overwrites':
        resolvedPayload = {
          ...remote,
          conflictResolution: 'remote_overwrites'
        };
        break;

      case 'manual_user_selection':
        resolvedPayload = customMergedData || local;
        break;
    }

    conflict.resolvedAt = new Date().toISOString();
    conflict.resolvedPayload = resolvedPayload;
    conflict.resolutionStrategy = strategy;

    // Update item in queue and re-queue for dispatch
    item.payload = resolvedPayload;
    item.status = 'resolved';

    // Commit resolved version locally into Dexie
    if (typeof indexedDB !== 'undefined' && item.entityType === 'session_note' && resolvedPayload) {
      try {
        await dexieDB.session_notes.put(resolvedPayload as SessionNote);
      } catch (err) {
        console.warn('[SyncQueue] Failed to put resolved note to Dexie:', err);
      }
    }

    this.conflicts.delete(queueItemId);
    item.status = 'pending';
    this.notifyQueueChange();

    // Trigger immediate sync
    if (this.isOnline) {
      void this.processQueue();
    }

    return true;
  }

  /**
   * Handles individual sync failure with retry scheduling
   */
  private handleItemFailure(item: SyncQueueItemExtended, errorMessage: string): void {
    item.retryCount += 1;
    item.errorMessage = errorMessage;

    if (item.retryCount >= this.maxRetries) {
      item.status = 'failed';
    } else {
      item.status = 'retry_scheduled';
      const delay = this.calculateBackoff(item.retryCount);
      item.nextRetryAt = new Date(Date.now() + delay).toISOString();

      const timer = setTimeout(() => {
        this.retryTimers.delete(item.id);
        if (this.isOnline && item.status === 'retry_scheduled') {
          item.status = 'pending';
          void this.processQueue();
        }
      }, delay);

      this.retryTimers.set(item.id, timer);
    }
  }

  /**
   * Internal synchronization executor
   */
  private async syncItemToStorage(item: SyncQueueItemExtended): Promise<void> {
    // 1. Ensure local Dexie record is updated and marked synced
    if (typeof indexedDB !== 'undefined' && item.entityType === 'session_note' && item.payload) {
      const note = item.payload as SessionNote;
      note.synced = true;
      note.syncTimestamp = new Date().toISOString();
      try {
        await dexieDB.session_notes.put(note);
      } catch (err) {
        console.warn('[SyncQueue] Failed to update session note sync state in Dexie:', err);
      }
    }

    // 2. Mock network round-trip latency (simulates Supabase write)
    await new Promise((resolve) => setTimeout(resolve, 30));
  }

  /**
   * Triggers manual retry for a specific item or all eligible items
   */
  public triggerRetry(itemId?: string): void {
    if (itemId) {
      const item = this.inMemoryQueue.get(itemId);
      if (item && (item.status === 'failed' || item.status === 'retry_scheduled')) {
        item.status = 'pending';
        item.retryCount = 0;
        void this.processQueue();
      }
    } else {
      this.inMemoryQueue.forEach((item) => {
        if (item.status === 'failed' || item.status === 'retry_scheduled') {
          item.status = 'pending';
          item.retryCount = 0;
        }
      });
      void this.processQueue();
    }
  }

  /**
   * Subscription hooks for UI components
   */
  public subscribe(listener: QueueListener): () => void {
    this.queueListeners.add(listener);
    listener(this.getStateSummary());
    return () => {
      this.queueListeners.delete(listener);
    };
  }

  public onConflict(listener: ConflictListener): () => void {
    this.conflictListeners.add(listener);
    return () => {
      this.conflictListeners.delete(listener);
    };
  }

  public getPendingConflicts(): ConflictRecord[] {
    return Array.from(this.conflicts.values());
  }

  public getStateSummary(): QueueStateSummary {
    const items = Array.from(this.inMemoryQueue.values());
    return {
      total: items.length,
      pending: items.filter((i) => i.status === 'pending').length,
      inProgress: items.filter((i) => i.status === 'in_progress').length,
      retryScheduled: items.filter((i) => i.status === 'retry_scheduled').length,
      conflicts: items.filter((i) => i.status === 'conflict_detected').length,
      failed: items.filter((i) => i.status === 'failed').length,
      synced: items.filter((i) => i.status === 'synced').length,
      isOnline: this.isOnline,
      isProcessing: this.isProcessing
    };
  }

  private notifyQueueChange(): void {
    const summary = this.getStateSummary();
    this.queueListeners.forEach((fn) => fn(summary));
  }

  /**
   * Tear-down to prevent memory leaks
   */
  public destroy(): void {
    this.retryTimers.forEach((timer) => clearTimeout(timer));
    this.retryTimers.clear();
    this.queueListeners.clear();
    this.conflictListeners.clear();

    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.boundOnlineHandler);
      window.removeEventListener('offline', this.boundOfflineHandler);
    }
  }
}

export const syncQueue = new SyncQueueManager();
