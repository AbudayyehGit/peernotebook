/**
 * Peer Notebook - Real-time Offline & Sync Status Indicator
 */

import React, { useState, useEffect } from 'react';
import { syncWorker, SyncStatusInfo } from '../services/syncWorker';
import { Cloud, CloudOff, RefreshCw, CheckCircle2 } from 'lucide-react';

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
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors shadow-xs ${
          isOnline
            ? syncInfo.pendingCount > 0
              ? 'bg-amber-950/60 border-amber-600/50 text-amber-300'
              : 'bg-emerald-950/60 border-emerald-600/50 text-emerald-300'
            : 'bg-rose-950/60 border-rose-600/50 text-rose-300'
        }`}
      >
        {isOnline ? (
          <>
            <span className="relative flex h-2 w-2">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  syncInfo.pendingCount > 0 ? 'bg-amber-400' : 'bg-emerald-400'
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  syncInfo.pendingCount > 0 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
              />
            </span>
            <Cloud className="w-3.5 h-3.5" />
            <span>
              {isSyncing
                ? 'Syncing...'
                : syncInfo.pendingCount > 0
                ? `${syncInfo.pendingCount} Offline Queued`
                : 'IndexedDB Encrypted & Synced'}
            </span>
          </>
        ) : (
          <>
            <CloudOff className="w-3.5 h-3.5 text-rose-400" />
            <span>Offline (IndexedDB Active)</span>
            {syncInfo.pendingCount > 0 && (
              <span className="bg-rose-900/80 px-1.5 py-0.5 rounded text-[10px] text-rose-200">
                {syncInfo.pendingCount}
              </span>
            )}
          </>
        )}

        <button
          onClick={handleManualSync}
          disabled={isSyncing}
          title="Force Sync with Cloud / Server"
          className="ml-1 p-0.5 hover:bg-white/10 rounded transition-transform active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {isHovered && (
        <div className="absolute right-0 top-full mt-2 w-64 p-3 bg-slate-900 text-slate-200 rounded-lg shadow-xl border border-slate-700 text-xs z-50">
          <div className="flex items-center gap-1.5 font-semibold text-white mb-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Local Storage Engine</span>
          </div>
          <p className="text-slate-400">
            IndexedDB Local Cache is active. Encrypted notes and client rosters are available even when offline in the field.
          </p>
          <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between">
            <span>Last sync:</span>
            <span className="font-mono text-slate-300">{syncInfo.lastSyncTime || 'Just now'}</span>
          </div>
        </div>
      )}
    </div>
  );
};
