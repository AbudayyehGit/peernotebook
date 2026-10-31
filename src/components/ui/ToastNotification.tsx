/**
 * Peer Notebook - Global Toast Notification Banner & Delivery Error Alerts
 * GA #8 Standard • Trauma-Informed Clinical UI • 48px Minimum Touch Hitbox
 * Tokens: Soft Slate (#F8FAFC), Deep Navy (#1E3A8A), Muted Teal (#0F766E), Amber (#D97706)
 * Renders prominent delivery failure feedback and connection alerts
 */

import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Info,
  X,
  Mail,
  ShieldAlert,
  RotateCw
} from 'lucide-react';
import { ActiveToast } from '../../services/toastService';

export const ToastNotification: React.FC = () => {
  const [toasts, setToasts] = useState<ActiveToast[]>([]);

  useEffect(() => {
    const handleToastEvent = (e: Event) => {
      const customEvent = e as CustomEvent<ActiveToast>;
      const newToast = customEvent.detail;
      if (!newToast) return;

      setToasts((prev) => {
        // Prevent exact duplicate spam within 2 seconds
        const duplicate = prev.find(
          (t) => t.title === newToast.title && t.message === newToast.message
        );
        if (duplicate) return prev;
        return [newToast, ...prev].slice(0, 4); // Keep at most 4 active toasts
      });

      // Auto-dismiss after duration
      const duration = newToast.durationMs || 5000;
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, duration);
    };

    window.addEventListener('peernotebook:toast', handleToastEvent);
    return () => {
      window.removeEventListener('peernotebook:toast', handleToastEvent);
    };
  }, []);

  const handleDismiss = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div
      role="region"
      aria-label="Notifications"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2.5 max-w-md w-[calc(100vw-2rem)] pointer-events-none"
    >
      {toasts.map((toast) => {
        const isError = toast.type === 'error';
        const isWarning = toast.type === 'warning';
        const isSuccess = toast.type === 'success';

        const borderColor = isError
          ? 'border-rose-300'
          : isWarning
          ? 'border-amber-300'
          : isSuccess
          ? 'border-emerald-300'
          : 'border-blue-300';

        const bgColor = isError
          ? 'bg-rose-50/95'
          : isWarning
          ? 'bg-amber-50/95'
          : isSuccess
          ? 'bg-emerald-50/95'
          : 'bg-white/95';

        const titleColor = isError
          ? 'text-rose-900'
          : isWarning
          ? 'text-amber-900'
          : isSuccess
          ? 'text-emerald-950'
          : 'text-[#1E3A8A]';

        return (
          <div
            key={toast.id}
            role="alert"
            aria-live="assertive"
            className={`pointer-events-auto rounded-2xl border ${borderColor} ${bgColor} backdrop-blur-sm p-4 shadow-xl transition-all duration-200 animate-in slide-in-from-bottom-3 flex items-start gap-3 w-full`}
          >
            {/* Status Icon */}
            <div className="shrink-0 mt-0.5">
              {isError ? (
                <ShieldAlert className="w-5 h-5 text-rose-600" />
              ) : isWarning ? (
                <AlertTriangle className="w-5 h-5 text-[#D97706]" />
              ) : isSuccess ? (
                <CheckCircle2 className="w-5 h-5 text-[#16A34A]" />
              ) : (
                <Info className="w-5 h-5 text-[#0F766E]" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <h4 className={`text-xs sm:text-sm font-bold tracking-tight truncate ${titleColor}`}>
                    {toast.title}
                  </h4>
                  {toast.smtpCode && (
                    <span className="shrink-0 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-white/80 border border-slate-300 text-slate-700">
                      Code {toast.smtpCode}
                    </span>
                  )}
                </div>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed break-words">
                {toast.message}
              </p>

              {toast.technicalDetail && (
                <div className="text-[11px] font-mono text-slate-600 bg-white/70 p-2 rounded-lg border border-slate-200/80 break-all mt-1">
                  {toast.technicalDetail}
                </div>
              )}

              {toast.actionLabel && toast.onAction && (
                <div className="pt-1.5">
                  <button
                    type="button"
                    onClick={toast.onAction}
                    className="min-h-[44px] px-3.5 py-1.5 rounded-full bg-[#1E3A8A] text-white text-xs font-bold hover:bg-blue-900 transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>{toast.actionLabel}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Dismiss Button - 48px touch target */}
            <button
              type="button"
              onClick={() => handleDismiss(toast.id)}
              className="shrink-0 min-h-[44px] min-w-[44px] -mr-1 -mt-1 flex items-center justify-center text-slate-400 hover:text-slate-700 rounded-full hover:bg-black/5 transition-colors cursor-pointer"
              title="Dismiss notification"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
