import { Component, ErrorInfo, ReactNode } from 'react';
import { ShieldCheck, RefreshCw, Download, AlertTriangle, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import { TelemetryService } from '../services/telemetryService';
import { peerNotebookDB } from '../db/peerNotebookDatabase';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
  copied: boolean;
  downloadingBackup: boolean;
}

export class FieldErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    showDetails: false,
    copied: false,
    downloadingBackup: false
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    // Telemetry to Vercel edge logs & local queue
    TelemetryService.trackException(error, {
      componentStack: errorInfo.componentStack,
      boundary: 'FieldErrorBoundary'
    });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleEmergencyExport = async () => {
    try {
      this.setState({ downloadingBackup: true });
      const jsonStr = await peerNotebookDB.exportFullBackupJSON();
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `peer-notebook-emergency-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      alert('Unable to extract emergency backup. Local storage remains intact in IndexedDB.');
    } finally {
      this.setState({ downloadingBackup: false });
    }
  };

  private handleCopyDiagnostic = () => {
    const diagnostic = {
      error: this.state.error?.message,
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    };
    navigator.clipboard.writeText(JSON.stringify(diagnostic, null, 2));
    this.setState({ copied: true });
    setTimeout(() => this.setState({ copied: false }), 2000);
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 sm:p-6 font-sans">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 max-w-xl w-full shadow-[0_4px_20px_rgba(15,23,42,0.06)] space-y-5 text-slate-800">
            {/* Header with Trauma-Informed Assurance */}
            <div className="flex items-start gap-3.5 pb-4 border-b border-slate-200">
              <div className="p-3 bg-amber-50 text-[#D97706] rounded-2xl border border-amber-200/80 shrink-0">
                <ShieldCheck className="w-7 h-7 text-[#0F766E]" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-[#1E3A8A]">
                  Session Safeguard Active
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                  A client interface exception occurred, but your offline encounter notes, rosters, and signed drafts remain <strong className="text-[#0F766E] font-semibold">safely preserved in Dexie.js local storage</strong>.
                </p>
              </div>
            </div>

            {/* Safety Callout Box */}
            <div className="p-4 bg-[#FEF3C7]/60 border border-amber-200/80 rounded-xl flex items-start gap-2.5 text-xs text-amber-900 leading-normal">
              <AlertTriangle className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-[#D97706]">Field Continuity Protected</p>
                <p className="mt-0.5 text-slate-700">
                  Telemetry has been logged for Vercel edge review. You can reload the workspace or export an emergency offline JSON backup at any time.
                </p>
              </div>
            </div>

            {/* Touch-Optimized Primary Recovery Actions (min 44px height) */}
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <button
                type="button"
                onClick={this.handleReload}
                className="flex-1 min-h-[46px] px-5 py-2.5 bg-[#0F766E] hover:bg-teal-800 active:bg-teal-900 text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Application</span>
              </button>

              <button
                type="button"
                onClick={this.handleEmergencyExport}
                disabled={this.state.downloadingBackup}
                className="min-h-[46px] px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <Download className="w-4 h-4 text-[#D97706]" />
                <span>{this.state.downloadingBackup ? 'Exporting...' : 'Emergency Backup'}</span>
              </button>
            </div>

            {/* Diagnostic Details Accordion */}
            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <button
                type="button"
                onClick={() => this.setState({ showDetails: !this.state.showDetails })}
                className="w-full min-h-[44px] px-4 py-2 bg-slate-50 hover:bg-slate-100 flex items-center justify-between font-semibold text-slate-600 transition-colors"
              >
                <span>Diagnostic Incident Information</span>
                {this.state.showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {this.state.showDetails && (
                <div className="p-4 bg-slate-900 text-slate-100 font-mono text-[11px] space-y-3 overflow-x-auto">
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Incident Trace:</span>
                    <button
                      type="button"
                      onClick={this.handleCopyDiagnostic}
                      className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-200 transition-colors"
                    >
                      {this.state.copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{this.state.copied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <p className="text-rose-400 font-bold">{this.state.error?.message || 'Unknown Exception'}</p>
                  <pre className="text-[10px] text-slate-300 whitespace-pre-wrap leading-tight max-h-40 overflow-y-auto">
                    {this.state.error?.stack || 'No stack trace available.'}
                  </pre>
                </div>
              )}
            </div>

            {/* Trust Footer */}
            <div className="text-center pt-2 text-[11px] text-slate-400 font-mono">
              CalAIM / Medi-Cal H0038 Compliance Layer • Peer Notebook GA #8
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
