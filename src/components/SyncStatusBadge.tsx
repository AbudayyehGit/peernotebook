/**
 * Peer Notebook - Real-time Offline & Dual-Layer Sync Status Indicator
 * Mobile-First Responsive Badge
 */

import React, { useState, useEffect } from 'react';
import { syncWorker, SyncStatusInfo } from '../services/syncWorker';
import { Cloud, CloudOff, RefreshCw, Database } from 'lucide-react';

export const SyncStatusBadge: React.FC = () => {
  const [syncInfo, setSyncInfo] = useState<SyncStatusInfo>(syncWorker.getStatus());
  const [isHovered, setIsHovered] = useState(false);

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
    <div
      className="relative inline-flex items-center shrink-0"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => setIsHovered(!isHovered)}
    >
      <div
        className={`flex items-center gap-1 sm:gap-2 px-1.5 xs:px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] xs:text-[11px] sm:text-xs font-medium border transition-colors shadow-2xs cursor-pointer shrink-0 ${
          isOnline
            ? syncInfo.pendingCount > 0
              ? 'bg-amber-50 border-amber-300 text-[#D97706]'
              : 'bg-emerald-50 border-emerald-300 text-[#16A34A]'
            : 'bg-rose-50 border-rose-300 text-rose-700'
        }`}
      >
        {isOnline ? (
          <>
            <span className="relative flex h-2 w-2 shrink-0">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  syncInfo.pendingCount > 0 ? 'bg-[#D97706]' : 'bg-[#16A34A]'
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  syncInfo.pendingCount > 0 ? 'bg-[#D97706]' : 'bg-[#16A34A]'
                }`}
              />
            </span>
            <Cloud className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden md:inline whitespace-nowrap">
              {isSyncing
                ? 'Syncing to Supabase...'
                : syncInfo.pendingCount > 0
                ? `${syncInfo.pendingCount} Queued in Dexie`
                : 'Dexie.js + Supabase Synced'}
            </span>
            <span className="hidden xs:inline md:hidden whitespace-nowrap font-medium">
              {isSyncing
                ? 'Syncing'
                : syncInfo.pendingCount > 0
                ? `${syncInfo.pendingCount} Q`
                : 'Synced'}
            </span>
            {syncInfo.pendingCount > 0 && (
              <span className="xs:hidden font-mono font-bold text-[9px] bg-amber-100 text-[#D97706] px-1 rounded">
                {syncInfo.pendingCount}
              </span>
            )}
          </>
        ) : (
          <>
            <CloudOff className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            <span className="hidden sm:inline whitespace-nowrap">Offline (Dexie.js)</span>
            <span className="hidden xs:inline sm:hidden whitespace-nowrap">Offline</span>
            {syncInfo.pendingCount > 0 && (
              <span className="bg-amber-100 text-[#D97706] px-1 sm:px-1.5 py-0.2 rounded text-[9px] sm:text-[10px] font-semibold border border-amber-200">
                {syncInfo.pendingCount}
              </span>
            )}
          </>
        )}

        <button
          onClick={handleManualSync}
          disabled={isSyncing}
          title="Force Sync with Cloud Store"
          className="ml-0.5 p-0.5 sm:p-1 hover:bg-black/5 rounded transition-transform active:scale-90 disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {isHovered && (
        <div className="absolute right-0 top-full mt-2 w-72 max-w-[calc(100vw-1.5rem)] p-3.5 sm:p-4 bg-white text-slate-800 rounded-xl shadow-xl border border-slate-200 text-xs z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="flex items-center gap-1.5 font-bold text-[#1E3A8A] mb-1">
            <Database className="w-4 h-4 text-[#0F766E] shrink-0" />
            <span>Dual-Layer Persistence Engine</span>
          </div>
          <p className="text-slate-600 leading-relaxed text-[11px] sm:text-xs">
            Encrypted client-side storage via Dexie.js (IndexedDB) with resilient background synchronization to PostgreSQL/Supabase under multi-tenant Row-Level Security (RLS).
          </p>
          <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
            <div className="flex justify-between">
              <span>Target Store:</span>
              <span className="font-semibold text-slate-800">{syncInfo.cloudTarget}</span>
            </div>
            <div className="flex justify-between">
              <span>Sync Success Rate:</span>
              <span className="font-mono font-bold text-[#16A34A]">{syncInfo.successRate}%</span>
            </div>
            <div className="flex justify-between">
              <span>Last Cloud Push:</span>
              <span className="font-mono text-slate-700 font-semibold">{syncInfo.lastSyncTime || 'Pending'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
