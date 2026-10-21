/**
 * Peer Notebook - Main Application Root
 * GA #8 Enterprise Grade • CalAIM & Medi-Cal H0038 Compliant
 * Visual: Soft Slate (#F8FAFC), Deep Navy (#1E3A8A), Muted Teal (#0F766E)
 * Mobile-First Responsive Architecture • Trauma-Informed Clinical Design
 */

import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PeerNotebookWorkspace } from './components/PeerNotebookWorkspace';
import { SyncStatusBadge } from './components/SyncStatusBadge';
import { OrgSelect } from './components/OrgSelect';
import { TrustComplianceFooter } from './components/TrustComplianceFooter';
import { FieldErrorBoundary } from './components/FieldErrorBoundary';
import { HeartHandshake } from 'lucide-react';

function AppContent() {
  const { currentOrg, currentUser, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center text-slate-600 px-4">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-9 h-9 border-3 border-[#0F766E] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-mono font-medium text-slate-600">Initializing Dexie.js Persistence Engine...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans selection:bg-[#0F766E] selection:text-white max-w-full overflow-x-hidden">
      {/* Top Header Navbar - Deep Navy (#1E3A8A) with min 44px tap target height */}
      <header className="bg-[#1E3A8A] border-b border-blue-950 sticky top-0 z-40 shadow-sm text-white w-full max-w-full">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 min-h-14 sm:min-h-16 py-1.5 sm:py-0 flex items-center justify-between gap-2 sm:gap-4 w-full">
          {/* Logo & Brand Identity (Structured Flexbox Wrapper: shrink-0 ensures brand title never gets crushed or overlapped) */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <a
              href="https://peernotebook.com"
              className="flex items-center gap-2 sm:gap-2.5 hover:opacity-95 transition-opacity"
              title="Peer Notebook - CalAIM H0038 Peer Encounter Documentation"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#0F766E] flex items-center justify-center text-white shadow-sm ring-1 ring-white/20 shrink-0">
                <HeartHandshake className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="flex flex-col justify-center min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <h1 className="text-sm sm:text-base font-bold text-white tracking-tight leading-tight whitespace-nowrap">
                    Peer Notebook
                  </h1>
                  <span className="hidden xs:inline-flex text-[10px] font-mono px-1.5 sm:px-2 py-0.5 rounded-md bg-blue-800/90 border border-blue-700/80 text-blue-100 font-semibold shrink-0">
                    CalAIM H0038
                  </span>
                </div>
                <p className="hidden md:block text-[11px] text-blue-100/90 leading-tight mt-0.5 truncate max-w-md lg:max-w-xl">
                  Medi-Cal Peer Encounter Documentation · Trauma-Informed Clinical System
                </p>
              </div>
            </a>
          </div>

          {/* Right Controls: Dual-Layer Sync Status & Org Select (Structured Flexbox: items-center justify-end gap-1.5 sm:gap-2.5 shrink-0) */}
          <div className="flex items-center justify-end gap-1.5 sm:gap-2.5 shrink-0">
            <SyncStatusBadge />
            <div className="hidden sm:block h-6 w-[1px] bg-blue-800/80 shrink-0" />
            <OrgSelect />
          </div>
        </div>
      </header>

      {/* Main Clinical Workspace */}
      <main className="flex-1 w-full max-w-full overflow-x-hidden">
        <PeerNotebookWorkspace />
      </main>

      {/* Professional Trust & Compliance Footer */}
      <TrustComplianceFooter />
    </div>
  );
}

export default function App() {
  return (
    <FieldErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </FieldErrorBoundary>
  );
}
