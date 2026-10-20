/**
 * Peer Notebook - Security, Compliance & System Settings Panel
 * GA #8 Production Grade • Trauma-Informed Clinical Design
 * Visuals: Soft Slate (#F8FAFC), Deep Navy (#1E3A8A), Muted Teal (#0F766E), Amber (#D97706)
 * Minimum 44px touch targets • Dexie.js Storage Metrics • Unsynced Session Counter
 * JSON Backup/Restore Portability • Manual "Force Sync" with Supabase
 */

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { peerNotebookDB, StorageMetrics } from '../db/peerNotebookDatabase';
import { AuditLogger } from '../services/auditLogger';
import { syncWorker, SyncStatusInfo, SyncResult } from '../services/syncWorker';
import { getSupabaseConfig, saveSupabaseConfig, clearSupabaseConfig } from '../lib/supabaseClient';
import {
  Shield,
  Database,
  Download,
  Upload,
  Trash2,
  Cloud,
  Check,
  ExternalLink,
  AlertTriangle,
  RefreshCw,
  HardDrive,
  Clock,
  CheckCircle2,
  FileCheck,
  Activity
} from 'lucide-react';

export const SettingsPanel: React.FC = () => {
  const { currentOrg, currentUser } = useAuth();
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [isSupabaseSaved, setIsSupabaseSaved] = useState(false);
  const [storageMetrics, setStorageMetrics] = useState<StorageMetrics | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatusInfo>(syncWorker.getStatus());
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  
  // Modals & UI States
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [restoreConfirmOpen, setRestoreConfirmOpen] = useState(false);
  const [pendingRestoreData, setPendingRestoreData] = useState<{
    rawJson: string;
    preview: { clientCount: number; noteCount: number; logCount: number; version: string };
  } | null>(null);
  const [restoreStatus, setRestoreStatus] = useState<string | null>(null);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const refreshMetrics = async () => {
    const metrics = await peerNotebookDB.getStorageMetrics();
    setStorageMetrics(metrics);
    const s = await syncWorker.refreshStatus();
    setSyncStatus(s);
  };

  useEffect(() => {
    const config = getSupabaseConfig();
    setSupabaseUrl(config.url);
    setSupabaseKey(config.anonKey);
    setIsSupabaseSaved(config.isConnected);

    refreshMetrics();

    const unsubscribe = syncWorker.subscribe((status) => {
      setSyncStatus(status);
    });

    return unsubscribe;
  }, []);

  const handleSaveSupabase = (e: React.FormEvent) => {
    e.preventDefault();
    if (supabaseUrl.trim() && supabaseKey.trim()) {
      saveSupabaseConfig(supabaseUrl.trim(), supabaseKey.trim());
      setIsSupabaseSaved(true);
      syncWorker.refreshStatus();
    }
  };

  const handleDisconnectSupabase = () => {
    clearSupabaseConfig();
    setSupabaseUrl('');
    setSupabaseKey('');
    setIsSupabaseSaved(false);
    syncWorker.refreshStatus();
  };

  const handleForceSync = async () => {
    setIsSyncing(true);
    setSyncResult(null);
    try {
      const res = await syncWorker.triggerManualSync();
      setSyncResult(res);
      await refreshMetrics();

      if (currentUser && currentOrg) {
        await AuditLogger.log({
          organizationId: currentOrg.id,
          actorId: currentUser.id,
          actorName: currentUser.fullName,
          actorRole: currentUser.role,
          action: 'MANUAL_SYNC',
          entityType: 'system',
          entityId: 'sync_queue',
          details: {
            syncedCount: res.syncedCount,
            successRate: res.successRate,
            cloudTarget: syncStatus.cloudTarget
          }
        });
      }
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncResult(null), 6000);
    }
  };

  const handleExportFullBackup = async () => {
    const jsonStr = await peerNotebookDB.exportFullBackupJSON(currentOrg?.id);
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(jsonStr);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    const dateFormatted = new Date().toISOString().split('T')[0];
    downloadAnchor.setAttribute('download', `peernotebook-backup-${currentOrg?.id || 'agency'}-${dateFormatted}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setExportNotice('Full backup JSON archive exported successfully.');
    setTimeout(() => setExportNotice(null), 4000);

    if (currentUser && currentOrg) {
      await AuditLogger.log({
        organizationId: currentOrg.id,
        actorId: currentUser.id,
        actorName: currentUser.fullName,
        actorRole: currentUser.role,
        action: 'EXPORT_PDF',
        entityType: 'system',
        entityId: 'full_database_backup',
        details: { exportFormat: 'full_json_bundle', records: storageMetrics?.noteCount }
      });
    }
  };

  const handleExportAuditLogs = async () => {
    const jsonStr = await AuditLogger.exportLogsJSON();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(jsonStr);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `audit-trail-${currentOrg?.id || 'peernotebook'}-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    if (currentUser && currentOrg) {
      await AuditLogger.log({
        organizationId: currentOrg.id,
        actorId: currentUser.id,
        actorName: currentUser.fullName,
        actorRole: currentUser.role,
        action: 'EXPORT_PDF',
        entityType: 'system',
        entityId: 'audit_logs',
        details: { exportFormat: 'json_sha256_verified' }
      });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        const clientCount = Array.isArray(parsed.clients) ? parsed.clients.length : 0;
        const noteCount = Array.isArray(parsed.sessionNotes) ? parsed.sessionNotes.length : 0;
        const logCount = Array.isArray(parsed.auditLogs) ? parsed.auditLogs.length : 0;
        const version = parsed.version || 'GA #8-v2.4';

        setPendingRestoreData({
          rawJson: text,
          preview: { clientCount, noteCount, logCount, version }
        });
        setRestoreConfirmOpen(true);
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : String(err);
        setRestoreStatus(`Failed to parse backup file: ${errMsg}`);
      }
    };
    reader.readAsText(file);
    // Reset file input so user can pick the same file again if desired
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleConfirmRestore = async () => {
    if (!pendingRestoreData) return;
    setRestoreStatus('Restoring data and resolving primary keys...');

    const res = await peerNotebookDB.restoreFullBackupJSON(pendingRestoreData.rawJson);
    if (res.success) {
      if (currentUser && currentOrg) {
        await AuditLogger.log({
          organizationId: currentOrg.id,
          actorId: currentUser.id,
          actorName: currentUser.fullName,
          actorRole: currentUser.role,
          action: 'RESTORE_BACKUP',
          entityType: 'system',
          entityId: 'dexie_indexeddb',
          details: res.importedCounts
        });
      }
      setRestoreStatus(res.message || 'Data restored successfully.');
      await refreshMetrics();
      setTimeout(() => {
        setRestoreConfirmOpen(false);
        setPendingRestoreData(null);
        setRestoreStatus(null);
      }, 2000);
    } else {
      setRestoreStatus(res.message || 'Restore failed.');
    }
  };

  const handleClearCache = async () => {
    await peerNotebookDB.clearAllData();
    if (currentUser && currentOrg) {
      await AuditLogger.log({
        organizationId: currentOrg.id,
        actorId: currentUser.id,
        actorName: currentUser.fullName,
        actorRole: currentUser.role,
        action: 'PURGE_CACHE',
        entityType: 'system',
        entityId: 'dexie_indexeddb'
      });
    }
    setResetConfirmOpen(false);
    window.location.reload();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 max-w-full overflow-hidden">
      {/* HIPAA Compliance & BAA Card */}
      <div className="p-5 sm:p-7 bg-white border border-slate-200/90 rounded-2xl shadow-[0_4px_20px_rgba(15,23,42,0.04)] space-y-5 max-w-full overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-50 text-[#16A34A] rounded-xl border border-emerald-200/80 shrink-0">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1E3A8A]">HIPAA Business Associate Agreement (BAA)</h3>
              <p className="text-xs text-slate-500 mt-0.5">45 CFR § 164.502(e) & 164.504(e) Executed Compliance Standard</p>
            </div>
          </div>
          <span className="self-start sm:self-auto px-3 py-1.5 bg-emerald-50 text-[#16A34A] border border-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0">
            <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
            BAA Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-xs">
          <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80">
            <span className="text-slate-500 block mb-1 font-semibold">Covered Agency:</span>
            <span className="font-bold text-slate-900 break-words">{currentOrg?.name}</span>
          </div>
          <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80">
            <span className="text-slate-500 block mb-1 font-semibold">NPI / Medi-Cal ID:</span>
            <span className="font-mono text-[#1E3A8A] font-bold break-words">{currentOrg?.npi} · {currentOrg?.medicaidProviderId}</span>
          </div>
          <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80">
            <span className="text-slate-500 block mb-1 font-semibold">BAA Specification:</span>
            <span className="font-mono text-[#0F766E] font-bold break-words">{currentOrg?.baaVersion || 'v2.4-GA8-CalAIM'}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-1 gap-3">
          <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
            Peer Notebook client records are encrypted locally in Dexie.js before being transmitted to the central cloud. Strict role-based client pseudonymization protects peer identities.
          </p>
          <a
            href="https://peernotebook.com/docs/04-technical-architecture/08_HIPAA_BAA_Consent_Model"
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-[44px] px-3.5 py-2 text-xs text-[#0F766E] font-bold hover:text-[#1E3A8A] flex items-center gap-1.5 shrink-0 transition-colors"
          >
            <span>View BAA White Paper</span>
            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
          </a>
        </div>
      </div>

      {/* Dexie.js (IndexedDB) Local Storage Usage & Portability Card */}
      <div className="p-5 sm:p-7 bg-white border border-slate-200/90 rounded-2xl shadow-[0_4px_20px_rgba(15,23,42,0.04)] space-y-5 max-w-full overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 text-[#1E3A8A] rounded-xl border border-blue-200/80 shrink-0">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1E3A8A]">Local Storage Persistence & Usage (Dexie.js)</h3>
              <p className="text-xs text-slate-500 mt-0.5">High-performance IndexedDB engine with quota monitoring and backup portability</p>
            </div>
          </div>
          <span className="self-start sm:self-auto text-xs font-mono text-[#1E3A8A] bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-xl font-bold shrink-0">
            Store: PeerNotebook_GA8_DB
          </span>
        </div>

        {/* Quota & Capacity Usage Bar */}
        <div className="p-4 bg-slate-50/90 rounded-xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 flex items-center gap-1.5">
              <HardDrive className="w-4 h-4 text-[#0F766E]" />
              Local Storage Quota & Capacity
            </span>
            <span className="font-mono font-bold text-slate-900">
              {storageMetrics ? `${storageMetrics.usageFormatted} / ${storageMetrics.quotaFormatted}` : 'Estimating...'}
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-[#0F766E] h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.max(1, storageMetrics?.percentUsed || 1)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>{storageMetrics?.percentUsed.toFixed(2)}% of browser storage capacity used</span>
            <span className="text-[#16A34A] font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Offline Read/Write Guaranteed
            </span>
          </div>
        </div>

        {/* Cached Entity Counts */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80">
            <span className="text-2xl font-black text-[#1E3A8A]">{storageMetrics?.clientCount ?? 0}</span>
            <span className="text-xs text-slate-500 block mt-1 font-semibold truncate">Active Clients</span>
          </div>
          <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80">
            <span className="text-2xl font-black text-[#0F766E]">{storageMetrics?.noteCount ?? 0}</span>
            <span className="text-xs text-slate-500 block mt-1 font-semibold truncate">CalAIM Notes</span>
          </div>
          <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80">
            <span className={`text-2xl font-black ${(storageMetrics?.unsyncedNoteCount ?? 0) > 0 ? 'text-[#D97706]' : 'text-[#16A34A]'}`}>
              {storageMetrics?.unsyncedNoteCount ?? 0}
            </span>
            <span className="text-xs text-slate-500 block mt-1 font-semibold truncate">Unsynced Sessions</span>
          </div>
          <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80">
            <span className="text-2xl font-black text-slate-700">{storageMetrics?.logCount ?? 0}</span>
            <span className="text-xs text-slate-500 block mt-1 font-semibold truncate">Audit Logs</span>
          </div>
        </div>

        {/* JSON Backup & Restore Portability Actions */}
        <div className="pt-2 border-t border-slate-100 space-y-3">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Data Portability & Emergency Backup (JSON)</h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Export Full JSON Backup */}
            <button
              type="button"
              onClick={handleExportFullBackup}
              className="min-h-[44px] flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold transition-all shadow-[0_2px_4px_rgba(15,23,42,0.04)] cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#0F766E] shrink-0" />
              <span>Export Full Backup (JSON)</span>
            </button>

            {/* Restore from JSON Backup */}
            <label className="min-h-[44px] flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold transition-all shadow-[0_2px_4px_rgba(15,23,42,0.04)] cursor-pointer">
              <Upload className="w-4 h-4 text-[#1E3A8A] shrink-0" />
              <span>Restore from Backup (JSON)</span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>

            {/* Export Audit Log */}
            <button
              type="button"
              onClick={handleExportAuditLogs}
              className="min-h-[44px] flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold transition-all shadow-[0_2px_4px_rgba(15,23,42,0.04)] cursor-pointer"
            >
              <FileCheck className="w-4 h-4 text-[#16A34A] shrink-0" />
              <span>Export Audit Trail (SHA-256)</span>
            </button>
          </div>

          {exportNotice && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-[#16A34A] font-semibold flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4 shrink-0" />
              <span>{exportNotice}</span>
            </div>
          )}

          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={() => setResetConfirmOpen(true)}
              className="min-h-[44px] flex items-center justify-center gap-1.5 px-4 py-2 text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4 shrink-0" />
              <span>Purge Local Dexie Cache</span>
            </button>
          </div>
        </div>
      </div>

      {/* Cloud & Supabase Backend Sync Configuration & Manual Trigger */}
      <div className="p-5 sm:p-7 bg-white border border-slate-200/90 rounded-2xl shadow-[0_4px_20px_rgba(15,23,42,0.04)] space-y-5 max-w-full overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-teal-50 text-[#0F766E] rounded-xl border border-teal-200/80 shrink-0">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1E3A8A]">PostgreSQL / Supabase Cloud Endpoint</h3>
              <p className="text-xs text-slate-500 mt-0.5">Dual-layer remote relational store with multi-tenant RLS & automatic sync flush</p>
            </div>
          </div>
          {isSupabaseSaved ? (
            <span className="self-start sm:self-auto px-3 py-1.5 bg-emerald-50 text-[#16A34A] border border-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0">
              <Check className="w-4 h-4" /> Connected
            </span>
          ) : (
            <span className="self-start sm:self-auto px-3 py-1.5 bg-slate-100 text-slate-600 border border-slate-200 rounded-xl text-xs font-semibold">
              Dexie Local Layer Active
            </span>
          )}
        </div>

        {/* Sync Status Banner & Manual Force Sync Button */}
        <div className="p-4 bg-slate-50/90 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#0F766E]" />
              <span className="text-xs font-bold text-slate-800">Dual-Layer Sync Engine Status:</span>
              <span className="text-xs font-mono font-bold text-[#1E3A8A]">{syncStatus.state.toUpperCase()}</span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
              <span>Target: <strong className="text-slate-800">{syncStatus.cloudTarget}</strong></span>
              <span>·</span>
              <span>Success Rate: <strong className="text-[#16A34A]">{syncStatus.successRate}%</strong> (Target ≥ 99.5%)</span>
              <span>·</span>
              <span>Last Push: <strong className="font-mono">{syncStatus.lastSyncTime || 'Pending'}</strong></span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleForceSync}
            disabled={isSyncing}
            className="min-h-[44px] px-5 py-2.5 bg-[#1E3A8A] hover:bg-blue-900 disabled:opacity-60 text-white rounded-xl text-xs font-bold shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-2 shrink-0"
          >
            <RefreshCw className={`w-4 h-4 shrink-0 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Synchronizing Queues...' : 'Force Sync with Supabase'}</span>
          </button>
        </div>

        {syncResult && (
          <div className={`p-3.5 rounded-xl text-xs font-semibold border flex items-center gap-2 animate-in fade-in ${
            syncResult.success ? 'bg-emerald-50 border-emerald-200 text-[#16A34A]' : 'bg-rose-50 border-rose-200 text-rose-700'
          }`}>
            {syncResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
            <span>{syncResult.message}</span>
          </div>
        )}

        <form onSubmit={handleSaveSupabase} className="space-y-4 pt-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Supabase Project URL
            </label>
            <input
              type="url"
              placeholder="https://xyzagency.supabase.co"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
              className="w-full min-h-[44px] px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-[#0F766E] focus:bg-white transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Supabase Anonymous API Key
            </label>
            <input
              type="password"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
              value={supabaseKey}
              onChange={(e) => setSupabaseKey(e.target.value)}
              className="w-full min-h-[44px] px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-[#0F766E] focus:bg-white transition-colors font-mono"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            {isSupabaseSaved && (
              <button
                type="button"
                onClick={handleDisconnectSupabase}
                className="min-h-[44px] px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Disconnect Remote
              </button>
            )}
            <button
              type="submit"
              className="min-h-[44px] px-5 py-2.5 bg-[#0F766E] hover:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-sm transition-colors cursor-pointer"
            >
              Save Cloud Configuration
            </button>
          </div>
        </form>
      </div>

      {/* Restore Confirmation Modal */}
      {restoreConfirmOpen && pendingRestoreData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-[#1E3A8A]">
              <Upload className="w-6 h-6 shrink-0 text-[#0F766E]" />
              <h3 className="font-bold text-slate-900 text-base">Restore System Backup?</h3>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              Found valid backup file archive (Format: {pendingRestoreData.preview.version}). Safe upsert will be performed to prevent primary key collisions.
            </p>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <div>Clients to import: <strong>{pendingRestoreData.preview.clientCount}</strong></div>
              <div>Session notes to import: <strong>{pendingRestoreData.preview.noteCount}</strong></div>
              <div>Audit logs to import: <strong>{pendingRestoreData.preview.logCount}</strong></div>
            </div>

            {restoreStatus && (
              <p className="text-xs font-semibold text-[#0F766E]">{restoreStatus}</p>
            )}

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setRestoreConfirmOpen(false);
                  setPendingRestoreData(null);
                  setRestoreStatus(null);
                }}
                className="min-h-[44px] px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRestore}
                className="min-h-[44px] px-5 py-2 bg-[#0F766E] hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Confirm Restore
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {resetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-rose-300 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="font-bold text-slate-900 text-base">Purge Local Dexie Cache?</h3>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              This will clear all cached peer clients, offline draft notes, and local audit logs. The initial CalAIM seed dataset will reinitialize upon reload.
            </p>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setResetConfirmOpen(false)}
                className="min-h-[44px] px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClearCache}
                className="min-h-[44px] px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Confirm Purge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
