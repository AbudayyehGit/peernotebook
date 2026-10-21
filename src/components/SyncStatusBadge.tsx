/**
 * Peer Notebook - Real-time Offline & Dual-Layer Sync Status Indicator
 * GA #8 Production Standards • Mobile-Responsive Tap Targets (44px min-h)
 * Explicit High Z-Index (z-50) Stack with Backdrop Overlay (bg-slate-900/20 backdrop-blur-sm)
 */

import React, { useState, useEffect } from 'react';
import { syncWorker, SyncStatusInfo } from '../services/syncWorker';
import { Cloud, CloudOff, RefreshCw, Database, X } from 'lucide-react';

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
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`min-h-[44px] flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-full text-xs font-semibold border transition-all shadow-2xs cursor-pointer shrink-0 ${
          isOnline
            ? syncInfo.pendingCount > 0
              ? 'bg-amber-50 border-amber-300 text-[#D97706]'
              : 'bg-emerald-50 border-emerald-300 text-[#16A34A]'
            : 'bg-rose-50 border-rose-300 text-rose-700'
        }`}
        title="Dual-layer Dexie.js + Supabase persistence status"
      >
        {isOnline ? (
          <>
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
            <Cloud className="w-4 h-4 shrink-0" />
            
            {/* Desktop label */}
            <span className="hidden md:inline whitespace-nowrap">
              {isSyncing
                ? 'Syncing to Supabase...'
                : syncInfo.pendingCount > 0
                ? `${syncInfo.pendingCount} Queued in Dexie`
                : 'Dexie.js + Supabase Synced'}
            </span>

            {/* Tablet label */}
            <span className="hidden sm:inline md:hidden whitespace-nowrap font-medium">
              {isSyncing
                ? 'Syncing'
                : syncInfo.pendingCount > 0
                ? `${syncInfo.pendingCount} Queued`
                : 'Synced'}
            </span>

            {/* Mobile queue badge */}
            {syncInfo.pendingCount > 0 && (
              <span className="sm:hidden font-mono font-bold text-[10px] bg-amber-100 text-[#D97706] px-1.5 py-0.5 rounded-md">
                {syncInfo.pendingCount}
              </span>
            )}
          </>
        ) : (
          <>
            <CloudOff className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="hidden sm:inline whitespace-nowrap">Offline (Dexie.js)</span>
            <span className="sm:hidden text-[10px] font-bold">Offline</span>
            {syncInfo.pendingCount > 0 && (
              <span className="bg-amber-100 text-[#D97706] px-1.5 py-0.5 rounded-md text-[10px] font-bold border border-amber-200">
                {syncInfo.pendingCount}
              </span>
            )}
          </>
        )}

        <button
          type="button"
          onClick={handleManualSync}
          disabled={isSyncing}
          title="Force Sync with Cloud Store"
          className="min-h-[40px] min-w-[40px] sm:min-h-[36px] sm:min-w-[36px] flex items-center justify-center p-1.5 hover:bg-black/5 rounded-full transition-transform active:scale-90 disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Sync Details Popover with Explicit High Z-Index & Backdrop Overlay */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
          />
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-x-3 top-16 sm:inset-auto sm:absolute sm:right-0 sm:top-full sm:mt-2 w-auto sm:w-80 max-w-[calc(100vw-1.5rem)] p-4 bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-200/90 text-xs z-50 animate-in fade-in zoom-in-95 duration-100"
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
                <span className="font-mono font-bold text-[#16A34A]">{syncInfo.successRate}%</span>
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
            <div className="mt-3 pt-2 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={handleManualSync}
                disabled={isSyncing}
                className="w-full py-2 bg-[#0F766E] hover:bg-teal-800 text-white font-bold rounded-xl text-xs transition-colors shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Syncing...' : 'Force Sync Now'}</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
