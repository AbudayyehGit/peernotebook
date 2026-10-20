/**
 * Peer Notebook - Trauma-Informed Field Error Boundary & Telemetry
 * Captures unhandled client runtime exceptions or database timeouts during active field sessions.
 * Protects offline Dexie.js drafts from being lost and provides immediate emergency JSON backup.
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { peerNotebookDB } from '../db/peerNotebookDatabase';
import { AuditLogger } from '../services/auditLogger';
import { ShieldAlert, Download, RefreshCw, Database } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  isExporting: boolean;
  exportSuccess: boolean;
}

export class FieldErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      isExporting: false,
      exportSuccess: false
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });

    // Non-blocking telemetry to edge logging / audit trail
    this.logErrorTelemetry(error, errorInfo);
  }

  private async logErrorTelemetry(error: Error, errorInfo: ErrorInfo): Promise<void> {
    try {
      // 1. Log to immutable local HIPAA audit log in Dexie.js
      await AuditLogger.log({
        organizationId: 'system-runtime',
        actorId: 'runtime-client',
        actorName: 'Client Runtime Environment',
        actorRole: 'compliance_officer',
        action: 'SYSTEM_ERROR',
        entityType: 'system',
        entityId: 'unhandled_exception',
        details: {
          errorMessage: error.message,
          errorStack: error.stack?.substring(0, 500),
          componentStack: errorInfo.componentStack?.substring(0, 500),
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
          timestamp: new Date().toISOString()
        }
      });

      // 2. Telemetry dispatch to edge logger (failover resilient)
      if (typeof fetch !== 'undefined') {
        fetch('/api/telemetry/edge-log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'CLIENT_RUNTIME_EXCEPTION',
            message: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack,
            url: typeof window !== 'undefined' ? window.location.href : '',
            timestamp: new Date().toISOString()
          }),
          keepalive: true
        }).catch(() => {
          // Expected in offline field conditions; swallow safely
        });
      }
    } catch {
      console.error('Failed to log telemetry:', error);
    }
  }

  private handleEmergencyExport = async (): Promise<void> => {
    this.setState({ isExporting: true });
    try {
      const jsonStr = await peerNotebookDB.exportFullBackupJSON();
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(jsonStr);
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `peernotebook-emergency-backup-${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      this.setState({ exportSuccess: true, isExporting: false });
    } catch (err) {
      console.error('Emergency backup export failed:', err);
      this.setState({ isExporting: false });
    }
  };

  private handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 sm:p-6 text-slate-800 font-sans">
          <div className="bg-white border border-slate-200/90 rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-[0_4px_25px_rgba(15,23,42,0.08)] space-y-5">
            {/* Header with Warm Amber / Orange Complement Accent */}
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-50 text-[#D97706] rounded-xl border border-amber-200 shrink-0">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#1E3A8A] leading-snug">
                  Field Session Protection Active
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  An interface interruption occurred, but your local clinical data is safe.
                </p>
              </div>
            </div>

            {/* Offline Safeguard Notice */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-[#0F766E]">
                <Database className="w-4 h-4 shrink-0" />
                <span>IndexedDB Local Layer Secured</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Peer Notebook’s dual-layer persistence maintains your active client rosters and note drafts in local storage. No data has been lost.
              </p>
              {this.state.error && (
                <div className="mt-2 p-2 bg-slate-100 rounded text-[11px] font-mono text-slate-700 break-words max-h-24 overflow-y-auto">
                  {this.state.error.message}
                </div>
              )}
            </div>

            {/* Recovery Action Buttons - Min 44px Tap Target */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleEmergencyExport}
                disabled={this.state.isExporting}
                className="min-h-[46px] px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold transition-all shadow-[0_2px_4px_rgba(15,23,42,0.04)] flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4 text-[#0F766E] shrink-0" />
                <span>{this.state.exportSuccess ? 'Backup Downloaded!' : 'Emergency Backup (JSON)'}</span>
              </button>

              <button
                type="button"
                onClick={this.handleReload}
                className="min-h-[46px] px-6 py-2.5 bg-[#1E3A8A] hover:bg-blue-900 text-white rounded-xl text-xs font-bold transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4 shrink-0" />
                <span>Reload Workspace</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
