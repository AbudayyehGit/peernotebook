/**
 * Peer Notebook - Plain-English Real-Time Offline & Cloud Sync Status Badge
 * GA #8 Production Standards • Mobile-Responsive Tap Targets (Minimum 48px height)
 * Friendly, Non-Technical Clinical Terminology (Zero internal library names like Dexie/Supabase in UI text)
 * High Z-Index Modal Stack with Crisp Backdrop Overlay (z-50+ backdrop-blur-sm)
 */

import React, { useState, useEffect } from 'react';
import { syncWorker, SyncStatusInfo } from '../services/syncWorker';
import { Cloud, CloudOff, RefreshCw, ShieldCheck, X, CheckCircle2, HardDrive, Lock } from 'lucide-react';

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
  const pendingCount = syncInfo.pendingCount;

  return (
    <div className="relative inline-flex items-center shrink-0">
      {/* Symmetrical Sync Status Pill (Minimum 48px touch target for clinical field ergonomics) */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`min-h-[48px] flex items-center justify-center gap-2 px-3 sm:px-3.5 py-2 rounded-full text-xs font-semibold border transition-all shadow-xs cursor-pointer shrink-0 active:scale-95 ${
          isOnline
            ? pendingCount > 0
              ? 'bg-amber-50 border-amber-300 text-[#D97706] hover:bg-amber-100/90'
              : 'bg-emerald-50 border-emerald-300 text-[#16A34A] hover:bg-emerald-100/90'
            : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200/90'
        }`}
        title="Encrypted Local Device & Cloud Backup Status (Click for Details)"
      >
        {isOnline ? (
          <>
            {/* Live Status Pulse Dot */}
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  pendingCount > 0 ? 'bg-[#D97706]' : 'bg-[#16A34A]'
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  pendingCount > 0 ? 'bg-[#D97706]' : 'bg-[#16A34A]'
                }`}
              />
            </span>

            {/* Cloud Icon */}
            <Cloud className="w-4 h-4 shrink-0" />

            {/* Plain-English Status Text: Zero technical database names */}
            <span className="text-xs font-semibold whitespace-nowrap">
              {isSyncing ? (
                <>
                  <span className="xs:hidden">Saving...</span>
                  <span className="hidden xs:inline">Saving to Cloud...</span>
                </>
              ) : pendingCount > 0 ? (
                <>
                  <span className="xs:hidden">{pendingCount} Saved Locally</span>
                  <span className="hidden xs:inline sm:hidden">{pendingCount} Notes Local</span>
                  <span className="hidden sm:inline">⚙️ {pendingCount} {pendingCount === 1 ? 'Note' : 'Notes'} Saved Locally</span>
                </>
              ) : (
                <>
                  <span className="xs:hidden">Synced</span>
                  <span className="hidden xs:inline sm:hidden">Cloud Active</span>
                  <span className="hidden sm:inline">🟢 Cloud Sync Active</span>
                </>
              )}
            </span>
          </>
        ) : (
          <>
            <CloudOff className="w-4 h-4 text-slate-500 shrink-0" />
            <span className="text-xs font-semibold whitespace-nowrap">
              <span className="xs:hidden">Offline</span>
              <span className="hidden xs:inline">Working Offline</span>
            </span>
            {pendingCount > 0 && (
              <span className="bg-amber-100 text-[#D97706] px-2 py-0.5 rounded-full text-xs font-bold border border-amber-300">
                {pendingCount}
              </span>
            )}
          </>
        )}

        {/* Quick Sync Button */}
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
          title="Backup Notes to Cloud Now"
          className="hidden sm:flex min-h-[44px] min-w-[44px] items-center justify-center p-2 hover:bg-black/5 rounded-full transition-transform active:scale-90 cursor-pointer"
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

          {/* Popover Modal Container (z-[60]) */}
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-x-3 sm:inset-x-auto top-20 sm:top-full sm:right-0 sm:mt-2 w-auto sm:w-88 max-w-[calc(100vw-1.5rem)] p-5 bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-200 text-xs z-[60] animate-in fade-in zoom-in-95 duration-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 font-bold text-[#1E3A8A]">
                <ShieldCheck className="w-4 h-4 text-[#0F766E] shrink-0" />
                <span className="text-sm">Offline Storage & Cloud Backup</span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                }}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-slate-600 leading-relaxed text-xs">
              All clinical encounter notes are securely encrypted and saved directly to your local device first. When internet connectivity is detected, your notes automatically and securely back up to your HIPAA-compliant cloud archive under multi-tenant access controls.
            </p>

            <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Cloud Connection:</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-[#16A34A]' : 'bg-slate-400'}`} />
                  {isOnline ? 'Active & Connected' : 'Offline Mode (Local Storage)'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Backup Health:</span>
                <span className="font-mono font-bold text-[#16A34A] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
                  {syncInfo.successRate}% Success Rate
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Last Cloud Backup:</span>
                <span className="font-mono text-slate-700 font-semibold">{syncInfo.lastSyncTime || 'Pending connection'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Local Unsynced Notes:</span>
                <span className={`font-mono font-bold ${pendingCount > 0 ? 'text-[#D97706]' : 'text-slate-700'}`}>
                  {pendingCount === 0 ? 'All notes backed up' : `${pendingCount} saved on this device`}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={handleManualSync}
                disabled={isSyncing}
                className="w-full min-h-[48px] py-2.5 bg-[#0F766E] hover:bg-teal-800 text-white font-bold rounded-xl text-xs sm:text-sm transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Backing Up Notes to Cloud...' : 'Back Up Notes to Cloud Now'}</span>
              </button>
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5 px-0.5">
                <span className="font-semibold text-slate-600">Peer Notebook LLC</span>
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
