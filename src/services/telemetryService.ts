/**
 * Peer Notebook - Field Telemetry & Vercel Edge Logging Service
 * GA #8 Production Grade • Tracks unhandled client exceptions, database timeouts,
 * and offline sync telemetry for active field peer specialist sessions.
 */

import { safeStorage } from '../utils/safeStorage';

export interface TelemetryPayload {
  level: 'error' | 'warn' | 'info';
  category: 'database_timeout' | 'sync_failure' | 'unhandled_exception' | 'session_anomaly' | 'storage_quota';
  message: string;
  errorName?: string;
  stackTrace?: string;
  componentStack?: string;
  context?: Record<string, unknown>;
  timestamp: string;
  sessionId?: string;
  url: string;
  userAgent: string;
  isOnline: boolean;
  dexieStatus?: string;
}

class TelemetryServiceClass {
  private queue: TelemetryPayload[] = [];
  private isFlushing = false;
  private readonly STORAGE_KEY = 'pn_offline_telemetry_queue';

  constructor() {
    this.loadPersistedQueue();
    // Flush telemetry when returning online
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.flushQueue();
      });
      // Global window error listener
      window.addEventListener('error', (event) => {
        this.trackException(event.error || new Error(event.message), {
          source: 'window.onerror',
          lineno: event.lineno,
          colno: event.colno,
          filename: event.filename
        });
      });
      // Unhandled promise rejections (e.g. Dexie or fetch timeouts)
      window.addEventListener('unhandledrejection', (event) => {
        const reason = event.reason;
        const error = reason instanceof Error ? reason : new Error(String(reason));
        const isDbTimeout = error.name === 'TimeoutError' || error.message.toLowerCase().includes('database') || error.message.toLowerCase().includes('indexeddb');
        
        this.logEvent({
          level: 'error',
          category: isDbTimeout ? 'database_timeout' : 'unhandled_exception',
          message: error.message || 'Unhandled Promise Rejection',
          errorName: error.name,
          stackTrace: error.stack,
          context: { reason: String(reason) }
        });
      });
    }
  }

  private loadPersistedQueue() {
    try {
      const stored = safeStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
      }
    } catch {
      this.queue = [];
    }
  }

  private persistQueue() {
    try {
      safeStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.queue.slice(-50)));
    } catch {
      // Storage quota or restricted
    }
  }

  /**
   * Log a structured telemetry event
   */
  public logEvent(event: Omit<TelemetryPayload, 'timestamp' | 'url' | 'userAgent' | 'isOnline'>) {
    const payload: TelemetryPayload = {
      ...event,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true
    };

    // Standardized console output for Vercel Edge Runtime log scraping
    console.error(`[PEER_NOTEBOOK_EDGE_TELEMETRY] [${payload.category.toUpperCase()}]`, JSON.stringify(payload));

    this.queue.push(payload);
    this.persistQueue();
    this.flushQueue();
  }

  /**
   * Track an uncaught exception from ErrorBoundary or catch block
   */
  public trackException(error: Error, context?: Record<string, unknown>) {
    const isTimeout = error.name.includes('Timeout') || error.message.toLowerCase().includes('timeout');
    
    this.logEvent({
      level: 'error',
      category: isTimeout ? 'database_timeout' : 'unhandled_exception',
      message: error.message || 'Unknown Exception',
      errorName: error.name,
      stackTrace: error.stack,
      context
    });
  }

  /**
   * Flush queue to Vercel Edge API endpoint
   */
  public async flushQueue(): Promise<void> {
    if (this.isFlushing || this.queue.length === 0) return;
    if (typeof navigator !== 'undefined' && !navigator.onLine) return;

    this.isFlushing = true;
    const batch = [...this.queue];

    try {
      const response = await fetch('/api/telemetry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ batch, sentAt: new Date().toISOString() })
      });

      if (response.ok) {
        // Remove transmitted items from queue
        this.queue = this.queue.filter(item => !batch.includes(item));
        this.persistQueue();
      }
    } catch {
      // Serverless endpoint offline or offline network; retain in queue for next flush
    } finally {
      this.isFlushing = false;
    }
  }

  public getPendingTelemetryCount(): number {
    return this.queue.length;
  }
}

export const TelemetryService = new TelemetryServiceClass();
