/**
 * Peer Notebook - Real-time Offline & Dual-Layer Sync Status Indicator
 * Forest Green (#16A34A) for Active Sync / Warm Amber (#D97706) for Queued Alerts
 */

import React, { useState, useEffect } from 'react';
import { syncWorker, SyncStatusInfo } from '../services/syncWorker';
import { Cloud, CloudOff, RefreshCw, CheckCircle2, Database } from 'lucide-react';

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
      className="relative inline-flex items-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors shadow-2xs ${
          isOnline
            ? syncInfo.pendingCount > 0
              ? 'bg-amber-50 border-amber-300 text-[#D97706]'
              : 'bg-emerald-50 border-emerald-300 text-[#16A34A]'
            : 'bg-rose-50 border-rose-300 text-rose-700'
        }`}
      >
        {isOnline ? (
          <>
            <span className="relative flex h-2 w-2">
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
            <Cloud className="w-3.5 h-3.5" />
            <span>
              {isSyncing
                ? 'Syncing to Supabase...'
                : syncInfo.pendingCount > 0
                ? `${syncInfo.pendingCount} Queued in Dexie`
                : 'Dexie.js + Supabase Synced'}
            </span>
          </>
        ) : (
          <>
            <CloudOff className="w-3.5 h-3.5 text-rose-600" />
            <span>Offline (Dexie.js Active)</span>
            {syncInfo.pendingCount > 0 && (
              <span className="bg-amber-100 text-[#D97706] px-1.5 py-0.2 rounded text-[10px] font-semibold border border-amber-200">
                {syncInfo.pendingCount}
              </span>
            )}
          </>
        )}

        <button
          onClick={handleManualSync}
          disabled={isSyncing}
          title="Force Sync with Cloud Store"
          className="ml-1 p-0.5 hover:bg-black/5 rounded transition-transform active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {isHovered && (
        <div className="absolute right-0 top-full mt-2 w-72 p-4 bg-white text-slate-800 rounded-xl shadow-xl border border-slate-200 text-xs z-50">
          <div className="flex items-center gap-1.5 font-bold text-[#1E3A8A] mb-1">
            <Database className="w-4 h-4 text-[#0F766E]" />
            <span>Dual-Layer Persistence Engine</span>
          </div>
          <p className="text-slate-600 leading-relaxed">
            Encrypted client-side storage via Dexie.js (IndexedDB) with resilient background synchronization to PostgreSQL/Supabase under multi-tenant Row-Level Security (RLS).
          </p>
          <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
            <span>Last Cloud Push:</span>
            <span className="font-mono text-slate-700 font-semibold">{syncInfo.lastSyncTime || 'Just now'}</span>
          </div>
        </div>
      )}
    </div>
  );
};
