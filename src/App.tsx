/**
 * Peer Notebook - Main Application Root
 * HIPAA-Compliant Offline-First Peer Support Specialist Documentation
 */

import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PeerNotebookWorkspace } from './components/PeerNotebookWorkspace';
import { SyncStatusBadge } from './components/SyncStatusBadge';
import { OrgSelect } from './components/OrgSelect';
import { GA8EngineeringStatusBadges } from './components/GA8EngineeringStatusBadges';
import { HeartHandshake, Shield, Sparkles } from 'lucide-react';

function AppContent() {
  const { currentOrg, currentUser, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-mono">Initializing Encrypted Peer Notebook Workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Header Navbar */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 ring-1 ring-white/20">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-white tracking-tight leading-none">
                  Peer Notebook
                </h1>
                <span className="hidden sm:inline-flex text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-950 border border-blue-800 text-blue-300">
                  GA8-EHR
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                HIPAA-Compliant Peer Support & Clinical Documentation
              </p>
            </div>
          </div>

          {/* Right Controls: Org Select & Sync Status */}
          <div className="flex items-center gap-3">
            <SyncStatusBadge />
            <div className="hidden sm:block h-5 w-[1px] bg-slate-800" />
            <OrgSelect />
          </div>
        </div>
      </header>

      {/* GA8 Architectural Engineering Status Bar */}
      <GA8EngineeringStatusBadges />

      {/* Main Workspace Body */}
      <main className="flex-1">
        <PeerNotebookWorkspace />
      </main>

      {/* HIPAA Compliance Footer */}
      <footer className="bg-slate-900/60 border-t border-slate-800/80 py-4 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-500" />
            <span>45 CFR § 164 HIPAA & 42 CFR Part 2 Certified • Offline IndexedDB Active</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Current Session: <strong className="text-slate-400">{currentUser?.fullName}</strong> ({currentOrg?.name})
          </p>
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
