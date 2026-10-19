/**
 * Peer Notebook - Security, Compliance & System Settings Panel
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { peerNotebookDB } from '../db/peerNotebookDatabase';
import { AuditLogger } from '../services/auditLogger';
import { getSupabaseConfig, saveSupabaseConfig, clearSupabaseConfig } from '../lib/supabaseClient';
import { Shield, Database, Lock, Download, Trash2, Cloud, Check, RefreshCw, AlertTriangle } from 'lucide-react';

export const SettingsPanel: React.FC = () => {
  const { currentOrg, currentUser } = useAuth();
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [isSupabaseSaved, setIsSupabaseSaved] = useState(false);
  const [clientCount, setClientCount] = useState(0);
  const [noteCount, setNoteCount] = useState(0);
  const [logCount, setLogCount] = useState(0);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  useEffect(() => {
    const config = getSupabaseConfig();
    setSupabaseUrl(config.url);
    setSupabaseKey(config.anonKey);
    setIsSupabaseSaved(config.isConnected);

    const loadCounts = async () => {
      const clients = await peerNotebookDB.getAllClients();
      const notes = await peerNotebookDB.getAllNotes();
      const logs = await peerNotebookDB.getAllAuditLogs();
      setClientCount(clients.length);
      setNoteCount(notes.length);
      setLogCount(logs.length);
    };
    loadCounts();
  }, []);

  const handleSaveSupabase = (e: React.FormEvent) => {
    e.preventDefault();
    if (supabaseUrl.trim() && supabaseKey.trim()) {
      saveSupabaseConfig(supabaseUrl.trim(), supabaseKey.trim());
      setIsSupabaseSaved(true);
    }
  };

  const handleDisconnectSupabase = () => {
    clearSupabaseConfig();
    setSupabaseUrl('');
    setSupabaseKey('');
    setIsSupabaseSaved(false);
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
        details: { exportFormat: 'json' }
      });
    }
  };

  const handleClearCache = async () => {
    await peerNotebookDB.clearAllData();
    setResetConfirmOpen(false);
    window.location.reload();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* HIPAA Compliance & BAA Card */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-600/20 text-emerald-400 rounded-xl">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">HIPAA Business Associate Agreement (BAA)</h3>
              <p className="text-xs text-slate-400">45 CFR § 164.502(e) & 164.504(e) Executed Status</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-full text-xs font-semibold">
            BAA Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-slate-850 rounded-lg border border-slate-800">
            <span className="text-slate-400 block mb-0.5">Covered Entity / Agency:</span>
            <span className="font-semibold text-white">{currentOrg?.name}</span>
          </div>
          <div className="p-3 bg-slate-850 rounded-lg border border-slate-800">
            <span className="text-slate-400 block mb-0.5">NPI / Medicaid ID:</span>
            <span className="font-mono text-blue-300">{currentOrg?.npi} • {currentOrg?.medicaidProviderId}</span>
          </div>
          <div className="p-3 bg-slate-850 rounded-lg border border-slate-800">
            <span className="text-slate-400 block mb-0.5">BAA Specification:</span>
            <span className="font-mono text-emerald-300">{currentOrg?.baaVersion || 'v2.4-GA8 Standard'}</span>
          </div>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Peer Notebook ensures data at rest in the client’s browser is stored in an encrypted IndexedDB compartment with automatic session timeout and role-based client pseudonymization.
        </p>
      </div>

      {/* Local IndexedDB Storage Metrics */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600/20 text-blue-400 rounded-xl">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Local Encrypted IndexedDB Engine</h3>
              <p className="text-xs text-slate-400">Offline persistence for field work and low-connectivity settings</p>
            </div>
          </div>
          <span className="text-xs font-mono text-blue-400 bg-blue-950/60 border border-blue-800 px-2.5 py-1 rounded">
            IDB Database: PeerNotebook_Local_DB_v2
          </span>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-slate-850 rounded-xl border border-slate-800">
            <span className="text-xl font-bold text-white">{clientCount}</span>
            <span className="text-xs text-slate-400 block mt-0.5">Cached Clients</span>
          </div>
          <div className="p-3 bg-slate-850 rounded-xl border border-slate-800">
            <span className="text-xl font-bold text-white">{noteCount}</span>
            <span className="text-xs text-slate-400 block mt-0.5">Clinical Notes</span>
          </div>
          <div className="p-3 bg-slate-850 rounded-xl border border-slate-800">
            <span className="text-xl font-bold text-white">{logCount}</span>
            <span className="text-xs text-slate-400 block mt-0.5">Audit Log Events</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <button
            onClick={handleExportAuditLogs}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition-colors"
          >
            <Download className="w-4 h-4 text-blue-400" />
            <span>Export Cryptographic Audit Trail (JSON)</span>
          </button>

          <button
            onClick={() => setResetConfirmOpen(true)}
            className="flex items-center gap-2 px-3 py-2 text-rose-400 hover:bg-rose-950/40 border border-rose-900/60 rounded-lg text-xs font-medium transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Purge Local Cache</span>
          </button>
        </div>
      </div>

      {/* Cloud & Supabase Backend Sync Configuration */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600/20 text-indigo-400 rounded-xl">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Central EHR Cloud Connection</h3>
              <p className="text-xs text-slate-400">Optional Supabase / PostgreSQL backend endpoint</p>
            </div>
          </div>
          {isSupabaseSaved ? (
            <span className="px-3 py-1 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-full text-xs font-semibold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Connected
            </span>
          ) : (
            <span className="px-3 py-1 bg-slate-800 text-slate-400 border border-slate-700 rounded-full text-xs">
              Local Mode (No Remote DB)
            </span>
          )}
        </div>

        <form onSubmit={handleSaveSupabase} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Supabase Project URL
            </label>
            <input
              type="url"
              placeholder="https://xyzcompany.supabase.co"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Supabase Anonymous Key
            </label>
            <input
              type="password"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
              value={supabaseKey}
              onChange={(e) => setSupabaseKey(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-hidden font-mono"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            {isSupabaseSaved && (
              <button
                type="button"
                onClick={handleDisconnectSupabase}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
              >
                Disconnect
              </button>
            )}
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium"
            >
              Save Cloud Configuration
            </button>
          </div>
        </form>
      </div>

      {/* Reset Confirmation Modal */}
      {resetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-slate-900 border border-rose-900/60 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-bold text-white text-base">Purge Local IndexedDB Cache?</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              This will erase all cached peer clients, offline draft notes, and local audit logs. The initial seed dataset will reinitialize upon app restart.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setResetConfirmOpen(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleClearCache}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-medium"
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
