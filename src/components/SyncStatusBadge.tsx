/**
 * Peer Notebook - Real-time Offline & Dual-Layer Sync Status Indicator
 * GA #8 Production Standards • Mobile-Responsive Tap Targets (44px min-h)
 * Explicit High Z-Index (z-50+) Stack with Backdrop Overlay (bg-slate-900/20 backdrop-blur-sm)
 * Structured Flexbox & Responsive Typography to Prevent Header & Brand Title Overlap
 */

import React, { useState, useEffect } from 'react';
import { syncWorker, SyncStatusInfo } from '../services/syncWorker';
import { Cloud, CloudOff, RefreshCw, Database, X, CheckCircle2 } from 'lucide-react';

export const SyncStatusBadge: React.FC = () => {
  const [syncInfo, setSyncInfo] = useState<SyncStatusInfo>(syncWorker.getStatus());
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = syncWorker.subscribe((info) => {
      setSyncInfo(info);
    });
    return unsubscribe;
  }, []);

  const handleManualSync = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await syncWorker.triggerManualSync();
  };

  const isOnline = syncInfo.state === 'online' || syncInfo.state === 'syncing';
  const isSyncing = syncInfo.state === 'syncing';

  return (
    <div className="relative inline-flex items-center shrink-0">
      {/* Symmetrical Sync Status Pill (Min 44px height for touch-first ergonomics) */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`min-h-[44px] flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-full text-xs font-semibold border transition-all shadow-2xs cursor-pointer shrink-0 active:scale-95 ${
          isOnline
            ? syncInfo.pendingCount > 0
              ? 'bg-amber-50 border-amber-300 text-[#D97706] hover:bg-amber-100/80'
              : 'bg-emerald-50 border-emerald-300 text-[#16A34A] hover:bg-emerald-100/80'
            : 'bg-rose-50 border-rose-300 text-rose-700 hover:bg-rose-100/80'
        }`}
        title="Dual-layer Dexie.js + Supabase persistence status (click for details)"
      >
        {isOnline ? (
          <>
            {/* Live status pulse dot */}
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  syncInfo.pendingCount > 0 ? 'bg-[#D97706]' : 'bg-[#16A34A]'
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  syncInfo.pendingCount > 0 ? 'bg-[#D97706]' : 'bg-[#16A34A]'
                }`}
              />
            </span>

            {/* Cloud Icon */}
            <Cloud className="w-4 h-4 shrink-0" />

            {/* Standardized Responsive Label: compact on mobile (<sm) to prevent any title overlap */}
            <span className="text-xs font-semibold whitespace-nowrap">
              {isSyncing ? (
                <>
                  <span className="xs:hidden">Syncing</span>
                  <span className="hidden xs:inline sm:hidden">Syncing...</span>
                  <span className="hidden sm:inline">Syncing to Supabase...</span>
                </>
              ) : syncInfo.pendingCount > 0 ? (
                <>
                  <span className="xs:hidden">{syncInfo.pendingCount}Q</span>
                  <span className="hidden xs:inline sm:hidden">{syncInfo.pendingCount} Queued</span>
                  <span className="hidden sm:inline">{syncInfo.pendingCount} Queued in Dexie</span>
                </>
              ) : (
                <>
                  <span className="hidden xs:inline sm:hidden">Synced</span>
                  <span className="hidden sm:inline md:hidden">Dexie + Cloud</span>
                  <span className="hidden md:inline">Dexie.js + Supabase Synced</span>
                </>
              )}
            </span>
          </>
        ) : (
          <>
            <CloudOff className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="text-xs font-semibold whitespace-nowrap">
              <span className="xs:hidden">Off</span>
              <span className="hidden xs:inline sm:hidden">Offline</span>
              <span className="hidden sm:inline">Offline (Dexie.js)</span>
            </span>
            {syncInfo.pendingCount > 0 && (
              <span className="bg-amber-100 text-[#D97706] px-1.5 py-0.5 rounded-md text-[10px] font-bold border border-amber-200">
                {syncInfo.pendingCount}
              </span>
            )}
          </>
        )}

        {/* Dedicated Quick Refresh Icon Button on sm+ screens */}
        <span
          role="button"
          tabIndex={0}
          onClick={handleManualSync}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleManualSync(e as unknown as React.MouseEvent);
            }
          }}
          title="Force Sync with Cloud Store"
          className="hidden sm:flex min-h-[32px] min-w-[32px] items-center justify-center p-1 hover:bg-black/10 rounded-full transition-transform active:scale-90 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
        </span>
      </button>

      {/* Sync Details Popover with Explicit High Z-Index Stack & Crisp Backdrop Overlay */}
      {isOpen && (
        <>
          {/* Crisp Backdrop Overlay (z-50) */}
          <div
            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
          />

          {/* Popover Modal Container (z-[60]): Safely below top header on mobile (top-20) to prevent overlap */}
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-x-3 sm:inset-x-auto top-20 sm:top-full sm:right-0 sm:mt-2 w-auto sm:w-80 max-w-[calc(100vw-1.5rem)] p-4 bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-200/90 text-xs z-[60] animate-in fade-in zoom-in-95 duration-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5 font-bold text-[#1E3A8A]">
                <Database className="w-4 h-4 text-[#0F766E] shrink-0" />
                <span>Dual-Layer Persistence Engine</span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                }}
                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-slate-600 leading-relaxed text-[11px] sm:text-xs">
              Encrypted client-side storage via Dexie.js (IndexedDB) with resilient background synchronization to PostgreSQL/Supabase under multi-tenant Row-Level Security (RLS).
            </p>

            <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-600 space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Target Store:</span>
                <span className="font-semibold text-slate-800 truncate max-w-[160px]">{syncInfo.cloudTarget}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Sync Success Rate:</span>
                <span className="font-mono font-bold text-[#16A34A] flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-[#16A34A]" />
                  {syncInfo.successRate}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Last Cloud Push:</span>
                <span className="font-mono text-slate-700 font-semibold">{syncInfo.lastSyncTime || 'Pending'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Pending Offline Queue:</span>
                <span className="font-mono font-bold text-[#D97706]">{syncInfo.pendingCount} records</span>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-100 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleManualSync}
                disabled={isSyncing}
                className="w-full min-h-[44px] py-2 bg-[#0F766E] hover:bg-teal-800 text-white font-bold rounded-xl text-xs transition-colors shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Syncing to Supabase...' : 'Force Sync with Supabase'}</span>
              </button>
              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5 px-0.5">
                <span className="font-semibold text-slate-600">peernotebook.com</span>
                <a
                  href="mailto:support@peernotebook.com"
                  className="text-[#0F766E] hover:underline font-medium"
                >
                  support@peernotebook.com
                </a>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
