/**
 * Peer Notebook - Main Application Root
 * GA #8 Enterprise Grade • CalAIM & Medi-Cal H0038 Compliant
 * Visual: Soft Slate (#F8FAFC), Deep Navy (#1E3A8A), Muted Teal (#0F766E)
 * Mobile-First Responsive Architecture • Trauma-Informed Clinical Design
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PeerNotebookWorkspace } from './components/PeerNotebookWorkspace';
import { SyncStatusBadge } from './components/SyncStatusBadge';
import { OrgSelect } from './components/OrgSelect';
import { TrustComplianceFooter } from './components/TrustComplianceFooter';
import { FieldErrorBoundary } from './components/FieldErrorBoundary';
import { LandingPage } from './components/LandingPage';
import { BetaOnboardingModal } from './components/BetaOnboardingModal';
import { OutreachTemplatesModal } from './components/OutreachTemplatesModal';
import { HeartHandshake, Sparkles, Globe, Mail } from 'lucide-react';

function AppContent() {
  const { currentOrg, currentUser, isLoading } = useAuth();
  const [currentView, setCurrentView] = useState<'landing' | 'workspace'>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash === '#workspace') return 'workspace';
      if (hash === '#landing' || hash === '#checklist' || hash === '#overview') return 'landing';
      const saved = localStorage.getItem('peernotebook_active_view');
      if (saved === 'workspace') return 'workspace';
    }
    return 'landing';
  });

  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [outreachOpen, setOutreachOpen] = useState(false);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#workspace') {
        setCurrentView('workspace');
      } else if (hash === '#landing' || hash === '#overview' || hash === '#lead-magnet' || hash === '#beta-cohort') {
        setCurrentView('landing');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const switchView = (view: 'landing' | 'workspace') => {
    setCurrentView(view);
    if (typeof window !== 'undefined') {
      localStorage.setItem('peernotebook_active_view', view);
      window.location.hash = view === 'workspace' ? '#workspace' : '#overview';
    }
  };

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

  if (currentView === 'landing') {
    return (
      <LandingPage onLaunchApp={() => switchView('workspace')} />
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans selection:bg-[#0F766E] selection:text-white max-w-full overflow-x-hidden">
      {/* Top Header Navbar - Deep Navy (#1E3A8A) with min 44px tap target height */}
      <header className="bg-[#1E3A8A] border-b border-blue-950 sticky top-0 z-40 shadow-sm text-white w-full max-w-full">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 min-h-14 sm:min-h-16 py-1.5 sm:py-0 flex items-center justify-between gap-2 sm:gap-4 w-full">
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={() => switchView('landing')}
              className="flex items-center gap-2 sm:gap-2.5 hover:opacity-95 transition-opacity cursor-pointer text-left"
              title="Return to Landing Page & Checklist"
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
            </button>
          </div>

          {/* Center Navigation Shortcuts for Beta Testers */}
          <div className="hidden lg:flex items-center gap-2 text-xs font-semibold">
            <button
              onClick={() => switchView('landing')}
              className="min-h-[36px] px-3 py-1.5 rounded-lg bg-blue-900/60 hover:bg-blue-800 text-blue-100 border border-blue-700/60 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-teal-300" />
              <span>Landing & Checklist</span>
            </button>
            <button
              onClick={() => setOnboardingOpen(true)}
              className="min-h-[36px] px-3 py-1.5 rounded-lg bg-blue-900/60 hover:bg-blue-800 text-blue-100 border border-blue-700/60 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>2-Min Walkthrough</span>
            </button>
            <button
              onClick={() => setOutreachOpen(true)}
              className="min-h-[36px] px-3 py-1.5 rounded-lg bg-blue-900/60 hover:bg-blue-800 text-blue-100 border border-blue-700/60 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Mail className="w-3.5 h-3.5 text-teal-300" />
              <span>Beta Outreach</span>
            </button>
          </div>

          {/* Right Controls: Dual-Layer Sync Status & Org Select */}
          <div className="flex items-center justify-end gap-1.5 sm:gap-2.5 shrink-0">
            {/* Mobile Switch to Landing Page Button */}
            <button
              onClick={() => switchView('landing')}
              className="lg:hidden min-h-[36px] px-2.5 py-1 text-xs font-semibold bg-blue-800 hover:bg-blue-700 text-white rounded-lg border border-blue-700 transition-colors"
            >
              Landing
            </button>
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

      {/* Beta Modals */}
      <BetaOnboardingModal
        isOpen={onboardingOpen}
        onClose={() => setOnboardingOpen(false)}
        onStartFirstNote={() => setOnboardingOpen(false)}
      />

      <OutreachTemplatesModal
        isOpen={outreachOpen}
        onClose={() => setOutreachOpen(false)}
      />
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
