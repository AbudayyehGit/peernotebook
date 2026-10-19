/**
 * Peer Notebook - Main Application Root
 * GA #8 Enterprise Grade • CalAIM & Medi-Cal H0038 Compliant
 * Visual: Soft Slate (#F8FAFC), Deep Navy (#1E3A8A), Muted Teal (#0F766E)
 */

import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PeerNotebookWorkspace } from './components/PeerNotebookWorkspace';
import { SyncStatusBadge } from './components/SyncStatusBadge';
import { OrgSelect } from './components/OrgSelect';
import { GA8EngineeringStatusBadges } from './components/GA8EngineeringStatusBadges';
import { HeartHandshake, Shield, ExternalLink } from 'lucide-react';

function AppContent() {
  const { currentOrg, currentUser, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center text-slate-600">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#0F766E] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-mono font-medium text-slate-600">Initializing Dexie.js Persistence Engine...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans selection:bg-[#0F766E] selection:text-white">
      {/* Top Header Navbar - Deep Navy (#1E3A8A) */}
      <header className="bg-[#1E3A8A] border-b border-blue-950 sticky top-0 z-40 shadow-sm text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0F766E] flex items-center justify-center text-white shadow-sm ring-1 ring-white/20">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <a href="https://peernotebook.com" className="hover:opacity-90 transition-opacity">
                  <h1 className="text-base font-bold text-white tracking-tight leading-none">
                    Peer Notebook
                  </h1>
                </a>
                <span className="hidden sm:inline-flex text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-800/80 border border-blue-700 text-blue-100 font-semibold">
                  GA #8 Enterprise
                </span>
              </div>
              <p className="text-[11px] text-blue-100 leading-tight mt-0.5">
                CalAIM & Medi-Cal H0038 Peer Encounter Documentation
              </p>
            </div>
          </div>

          {/* Right Controls: Org Select & Dual-Layer Sync Status */}
          <div className="flex items-center gap-3">
            <SyncStatusBadge />
            <div className="hidden sm:block h-5 w-[1px] bg-blue-800" />
            <OrgSelect />
          </div>
        </div>
      </header>

      {/* GA #8 Observability Status Badges */}
      <GA8EngineeringStatusBadges />

      {/* Main Clinical Workspace */}
      <main className="flex-1">
        <PeerNotebookWorkspace />
      </main>

      {/* Regulatory Compliance Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#16A34A]" />
            <span className="font-medium text-slate-700">
              California CalAIM & Medi-Cal H0038 Compliant • Dual-Layer Persistence (Dexie.js + Supabase)
            </span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>
              Provider: <strong className="text-slate-700">{currentUser?.fullName}</strong> ({currentOrg?.name})
            </span>
            <span>•</span>
            <a
              href="https://peernotebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#0F766E] font-semibold hover:underline flex items-center gap-1"
            >
              <span>peernotebook.com</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
