/**
 * Peer Notebook - Security, Compliance & System Settings Panel
 * Soft Slate (#F8FAFC), Deep Navy (#1E3A8A), Muted Teal (#0F766E)
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { peerNotebookDB } from '../db/peerNotebookDatabase';
import { AuditLogger } from '../services/auditLogger';
import { getSupabaseConfig, saveSupabaseConfig, clearSupabaseConfig } from '../lib/supabaseClient';
import { Shield, Database, Lock, Download, Trash2, Cloud, Check, ExternalLink, AlertTriangle } from 'lucide-react';

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
      <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 text-[#16A34A] rounded-xl border border-emerald-200">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1E3A8A]">HIPAA Business Associate Agreement (BAA)</h3>
              <p className="text-xs text-slate-500">45 CFR § 164.502(e) & 164.504(e) Executed Compliance Standard</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-emerald-50 text-[#16A34A] border border-emerald-300 rounded-full text-xs font-bold">
            BAA Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-500 block mb-0.5 font-semibold">Covered Agency:</span>
            <span className="font-bold text-slate-900">{currentOrg?.name}</span>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-500 block mb-0.5 font-semibold">NPI / Medi-Cal ID:</span>
            <span className="font-mono text-[#1E3A8A] font-bold">{currentOrg?.npi} • {currentOrg?.medicaidProviderId}</span>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-500 block mb-0.5 font-semibold">BAA Specification:</span>
            <span className="font-mono text-[#0F766E] font-bold">{currentOrg?.baaVersion || 'v2.4-GA8-CalAIM'}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
            Peer Notebook client records are encrypted locally in Dexie.js before being transmitted to the central cloud. Strict role-based client pseudonymization protects peer identities.
          </p>
          <a
            href="https://peernotebook.com/docs/04-technical-architecture/08_HIPAA_BAA_Consent_Model"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#0F766E] font-semibold hover:underline flex items-center gap-1 shrink-0 ml-4"
          >
            <span>View BAA White Paper</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Dual-Layer Persistence Engine (Dexie.js / IndexedDB) */}
      <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-[#1E3A8A] rounded-xl border border-blue-200">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1E3A8A]">Local Storage Persistence (Dexie.js / IndexedDB)</h3>
              <p className="text-xs text-slate-500">Offline-first local cache for field encounters with low connectivity</p>
            </div>
          </div>
          <span className="text-xs font-mono text-[#1E3A8A] bg-blue-50 border border-blue-200 px-3 py-1 rounded-md font-semibold">
            Store: PeerNotebook_GA8_DB
          </span>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-2xl font-black text-[#1E3A8A]">{clientCount}</span>
            <span className="text-xs text-slate-500 block mt-0.5 font-medium">Cached Clients</span>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-2xl font-black text-[#0F766E]">{noteCount}</span>
            <span className="text-xs text-slate-500 block mt-0.5 font-medium">CalAIM Notes</span>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-2xl font-black text-[#16A34A]">{logCount}</span>
            <span className="text-xs text-slate-500 block mt-0.5 font-medium">Audit Events</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <button
            onClick={handleExportAuditLogs}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-lg text-xs font-semibold transition-colors"
          >
            <Download className="w-4 h-4 text-[#0F766E]" />
            <span>Export SHA-256 Audit Trail (JSON)</span>
          </button>

          <button
            onClick={() => setResetConfirmOpen(true)}
            className="flex items-center gap-2 px-3 py-2 text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg text-xs font-semibold transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Purge Local Storage</span>
          </button>
        </div>
      </div>

      {/* Cloud & Supabase Backend Sync Configuration */}
      <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-teal-50 text-[#0F766E] rounded-xl border border-teal-200">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1E3A8A]">PostgreSQL / Supabase Cloud Endpoint</h3>
              <p className="text-xs text-slate-500">Dual-layer remote relational store with multi-tenant RLS</p>
            </div>
          </div>
          {isSupabaseSaved ? (
            <span className="px-3 py-1 bg-emerald-50 text-[#16A34A] border border-emerald-300 rounded-full text-xs font-bold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Connected
            </span>
          ) : (
            <span className="px-3 py-1 bg-slate-100 text-slate-600 border border-slate-200 rounded-full text-xs font-semibold">
              Dexie Local Layer Active
            </span>
          )}
        </div>

        <form onSubmit={handleSaveSupabase} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Supabase Project URL
            </label>
            <input
              type="url"
              placeholder="https://xyzagency.supabase.co"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-[#0F766E]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Supabase Anonymous API Key
            </label>
            <input
              type="password"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
              value={supabaseKey}
              onChange={(e) => setSupabaseKey(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden font-mono"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            {isSupabaseSaved && (
              <button
                type="button"
                onClick={handleDisconnectSupabase}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
              >
                Disconnect Remote
              </button>
            )}
            <button
              type="submit"
              className="px-4 py-2 bg-[#0F766E] hover:bg-teal-800 text-white rounded-lg text-xs font-semibold shadow-xs"
            >
              Save Cloud Configuration
            </button>
          </div>
        </form>
      </div>

      {/* Reset Confirmation Modal */}
      {resetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-rose-300 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-bold text-slate-900 text-base">Purge Local Dexie Cache?</h3>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              This will clear all cached peer clients, offline draft notes, and local audit logs. The initial CalAIM seed dataset will reinitialize upon reload.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setResetConfirmOpen(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleClearCache}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold"
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
