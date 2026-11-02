/**
 * Peer Notebook - Sprint 2: Network Monitor & Debounced Auto-Save (SP2-03)
 * Global network state listener, resilient debounced Dexie auto-save,
 * zero unhandled promise rejections, and explicit offline status event dispatcher.
 *
 * Attribution: H. Joe Abudayyeh & Peer Notebook LLC (2026-2027)
 */

import { syncQueue } from './SyncQueue';

export type NetworkEventType =
  | 'network_online'
  | 'network_offline'
  | 'connection_degraded'
  | 'auto_save_scheduled'
  | 'auto_save_completed'
  | 'auto_save_failed';

export interface NetworkDiagnostics {
  isOnline: boolean;
  effectiveType?: string; // '4g' | '3g' | '2g' | 'slow-2g'
  rtt?: number;           // round-trip time ms
  downlink?: number;      // Mbps
  saveData?: boolean;
  lastChangedAt: string;
  pendingAutoSavesCount: number;
}

export interface NetworkStateEvent {
  type: NetworkEventType;
  timestamp: string;
  isOnline: boolean;
  diagnostics: NetworkDiagnostics;
  details?: Record<string, unknown>;
}

export type NetworkListener = (event: NetworkStateEvent) => void;

interface PendingSaveEntry<T = unknown> {
  key: string;
  data: T;
  timer: ReturnType<typeof setTimeout>;
  saveFn: (data: T) => Promise<void>;
  enqueuedAt: number;
}

export class NetworkMonitor {
  private isOnline: boolean = typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean' ? navigator.onLine : true;
  private lastChangedAt: string = new Date().toISOString();
  private pendingSaves: Map<string, PendingSaveEntry<unknown>> = new Map();
  private listeners: Set<NetworkListener> = new Set();
  private boundOnlineHandler: () => void;
  private boundOfflineHandler: () => void;
  private boundConnectionChangeHandler?: () => void;

  constructor() {
    this.boundOnlineHandler = () => this.handleNetworkTransition(true);
    this.boundOfflineHandler = () => this.handleNetworkTransition(false);

    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.boundOnlineHandler);
      window.addEventListener('offline', this.boundOfflineHandler);

      // Listen to Network Information API if supported
      const nav = navigator as unknown as { connection?: EventTarget & { effectiveType?: string } };
      if (nav.connection && typeof nav.connection.addEventListener === 'function') {
        this.boundConnectionChangeHandler = () => {
          this.dispatchNetworkEvent('connection_degraded', {
            note: 'Network interface characteristics modified'
          });
        };
        nav.connection.addEventListener('change', this.boundConnectionChangeHandler);
      }
    }
  }

  /**
   * Safe network transition handler resilient against unhandled promise rejections
   */
  private handleNetworkTransition(online: boolean): void {
    try {
      this.isOnline = online;
      this.lastChangedAt = new Date().toISOString();

      const eventType: NetworkEventType = online ? 'network_online' : 'network_offline';

      // Inform sync queue directly
      try {
        syncQueue.handleNetworkStateChange(online);
      } catch (err) {
        console.warn('[NetworkMonitor] Error updating sync queue on transition:', err);
      }

      // If connection dropped, flush all pending auto-saves to local storage immediately
      if (!online) {
        void this.flushAllPendingSaves().catch((err) => {
          console.warn('[NetworkMonitor] Background flush failed gracefully on offline transition:', err);
        });
      }

      this.dispatchNetworkEvent(eventType);
    } catch (unhandled) {
      // Shield the environment from any unhandled rejection
      console.warn('[NetworkMonitor] Caught exception during network transition:', unhandled);
    }
  }

  /**
   * Returns current network diagnostics
   */
  public getDiagnostics(): NetworkDiagnostics {
    let effectiveType: string | undefined;
    let rtt: number | undefined;
    let downlink: number | undefined;
    let saveData: boolean | undefined;

    if (typeof navigator !== 'undefined') {
      const nav = navigator as unknown as {
        connection?: {
          effectiveType?: string;
          rtt?: number;
          downlink?: number;
          saveData?: boolean;
        };
      };

      if (nav.connection) {
        effectiveType = nav.connection.effectiveType;
        rtt = nav.connection.rtt;
        downlink = nav.connection.downlink;
        saveData = nav.connection.saveData;
      }
    }

    return {
      isOnline: this.isOnline,
      effectiveType,
      rtt,
      downlink,
      saveData,
      lastChangedAt: this.lastChangedAt,
      pendingAutoSavesCount: this.pendingSaves.size
    };
  }

  /**
   * Debounced Auto-Save Scheduler for Dexie.js
   * Prevents write churn while guaranteeing persistence on connection loss
   */
  public scheduleAutoSave<T>(
    key: string,
    data: T,
    saveToDexie: (data: T) => Promise<void>,
    debounceMs: number = 600
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Cancel existing pending save for this key
        const existing = this.pendingSaves.get(key);
        if (existing) {
          clearTimeout(existing.timer);
        }

        const timer = setTimeout(async () => {
          this.pendingSaves.delete(key);
          try {
            await saveToDexie(data);
            this.dispatchNetworkEvent('auto_save_completed', { key });
            resolve();
          } catch (err) {
            this.dispatchNetworkEvent('auto_save_failed', { key, error: String(err) });
            // Guard rejection so it never bubbles to unhandled window rejection
            resolve();
          }
        }, debounceMs);

        this.pendingSaves.set(key, {
          key,
          data,
          timer,
          saveFn: saveToDexie as (data: unknown) => Promise<void>,
          enqueuedAt: Date.now()
        });

        this.dispatchNetworkEvent('auto_save_scheduled', { key, debounceMs });
      } catch (err) {
        // Non-throwing promise resolution
        console.warn(`[NetworkMonitor] Auto-save schedule error for key [${key}]:`, err);
        resolve();
      }
    });
  }

  /**
   * Immediately commits all pending auto-save operations to Dexie
   */
  public async flushAllPendingSaves(): Promise<number> {
    const entries = Array.from(this.pendingSaves.values());
    let flushedCount = 0;

    for (const entry of entries) {
      clearTimeout(entry.timer);
      this.pendingSaves.delete(entry.key);
      try {
        await entry.saveFn(entry.data);
        flushedCount++;
      } catch (err) {
        console.warn(`[NetworkMonitor] Flush failed for key [${entry.key}]:`, err);
      }
    }

    return flushedCount;
  }

  /**
   * Explicit event dispatcher (Typed callbacks + Window CustomEvent)
   */
  private dispatchNetworkEvent(type: NetworkEventType, details?: Record<string, unknown>): void {
    const diagnostics = this.getDiagnostics();
    const eventPayload: NetworkStateEvent = {
      type,
      timestamp: new Date().toISOString(),
      isOnline: this.isOnline,
      diagnostics,
      details
    };

    // 1. Notify typed internal subscribers
    this.listeners.forEach((listener) => {
      try {
        listener(eventPayload);
      } catch (err) {
        console.warn('[NetworkMonitor] Exception in subscriber callback:', err);
      }
    });

    // 2. Dispatch custom DOM event if in browser
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      try {
        const domEvent = new CustomEvent('peernotebook:network-state', {
          detail: eventPayload
        });
        window.dispatchEvent(domEvent);
      } catch {
        // Safe fallback in restricted environments
      }
    }
  }

  /**
   * Subscribes to network status events
   */
  public onStatusChange(listener: NetworkListener): () => void {
    this.listeners.add(listener);
    // Emit initial diagnostics
    try {
      listener({
        type: this.isOnline ? 'network_online' : 'network_offline',
        timestamp: new Date().toISOString(),
        isOnline: this.isOnline,
        diagnostics: this.getDiagnostics()
      });
    } catch {
      // Safe no-op
    }

    return () => {
      this.listeners.delete(listener);
    };
  }

  public getIsOnline(): boolean {
    return this.isOnline;
  }

  /**
   * Full teardown to eliminate memory leaks and pending timers
   */
  public destroy(): void {
    this.pendingSaves.forEach((entry) => clearTimeout(entry.timer));
    this.pendingSaves.clear();
    this.listeners.clear();

    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.boundOnlineHandler);
      window.removeEventListener('offline', this.boundOfflineHandler);

      const nav = navigator as unknown as { connection?: EventTarget & { removeEventListener?: (type: string, fn: () => void) => void } };
      if (nav.connection && typeof nav.connection.removeEventListener === 'function' && this.boundConnectionChangeHandler) {
        nav.connection.removeEventListener('change', this.boundConnectionChangeHandler);
      }
    }
  }
}

export const networkMonitor = new NetworkMonitor();
