/**
 * Peer Notebook - Main Application Root
 * GA #8 Enterprise Grade • CalAIM & Medi-Cal H0038 Compliant
 * Visual: Soft Slate (#F8FAFC), Deep Navy (#1E3A8A), Muted Teal (#0F766E)
 * Mobile-First Responsive Architecture
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PeerNotebookWorkspace, WorkspaceTab } from './components/PeerNotebookWorkspace';
import { SyncStatusBadge } from './components/SyncStatusBadge';
import { OrgSelect } from './components/OrgSelect';
import { EnterpriseFooter } from './components/EnterpriseFooter';
import { HeartHandshake } from 'lucide-react';

function AppContent() {
  const { currentOrg, currentUser, isLoading } = useAuth();
  const [currentTab, setCurrentTab] = useState<WorkspaceTab>('dashboard');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center text-slate-600 px-4">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-8 h-8 border-3 border-[#0F766E] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-mono font-medium text-slate-600">Initializing Dexie.js Persistence Engine...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans selection:bg-[#0F766E] selection:text-white max-w-full overflow-x-hidden">
      {/* Top Header Navbar - Deep Navy (#1E3A8A) */}
      <header className="bg-[#1E3A8A] border-b border-blue-950 sticky top-0 z-40 shadow-sm text-white w-full max-w-full">
        <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 min-h-14 sm:min-h-16 py-1.5 sm:py-0 flex items-center justify-between gap-1.5 sm:gap-4 flex-nowrap w-full overflow-hidden">
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-1.5 sm:gap-3 min-w-0 shrink">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#0F766E] flex items-center justify-center text-white shadow-sm ring-1 ring-white/20 shrink-0">
              <HeartHandshake className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1 sm:gap-2">
                <a href="https://peernotebook.com" className="hover:opacity-90 transition-opacity">
                  <h1 className="text-xs xs:text-sm sm:text-base font-bold text-white tracking-tight leading-none whitespace-nowrap truncate">
                    Peer Notebook
                  </h1>
                </a>
                <span className="hidden xs:inline-flex text-[9px] sm:text-[10px] font-mono px-1.5 sm:px-2 py-0.5 rounded-full bg-blue-800/80 border border-blue-700 text-blue-100 font-semibold shrink-0">
                  GA #8
                </span>
              </div>
              <p className="hidden md:block text-[11px] text-blue-100 leading-tight mt-0.5 truncate">
                CalAIM & Medi-Cal H0038 Peer Encounter Documentation
              </p>
            </div>
          </div>

          {/* Right Controls: Org Select & Dual-Layer Sync Status */}
          <div className="flex items-center gap-1 sm:gap-3 shrink-0 ml-auto">
            <SyncStatusBadge />
            <div className="hidden sm:block h-5 w-[1px] bg-blue-800" />
            <OrgSelect />
          </div>
        </div>
      </header>

      {/* Main Clinical Workspace */}
      <main className="flex-1 w-full max-w-full overflow-x-hidden">
        <PeerNotebookWorkspace onTabChange={setCurrentTab} />
      </main>

      {/* Professional Enterprise Footer (Rendered for sub-pages; Dashboard includes its Enterprise Footer) */}
      {currentTab !== 'dashboard' && (
        <EnterpriseFooter onNavigateTab={(tab) => setCurrentTab(tab as WorkspaceTab)} />
      )}
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
