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
import { DocumentationViewer } from './components/DocumentationViewer';
import { BetaOnboardingModal } from './components/BetaOnboardingModal';
import { OutreachTemplatesModal } from './components/OutreachTemplatesModal';
import { InteractiveTutorialWizard } from './components/InteractiveTutorialWizard';
import { ZeroAiBadge } from './components/ZeroAiBadge';
import { TrustCenterView } from './components/TrustCenterView';
import { PrivacyConsentBanner } from './components/PrivacyConsentBanner';
import { PrivacyModeProvider, usePrivacyMode } from './context/PrivacyModeContext';
import { AuthModal } from './components/AuthModal';
import { Navbar } from './components/Navbar';
import { SubscriptionStatusBadge } from './components/SubscriptionStatusBadge';
import { BillingModal } from './components/BillingModal';
import { HeartHandshake, Sparkles, Globe, Mail, BookOpen, Eye, EyeOff, Lock, UserCheck } from 'lucide-react';
import { safeStorage } from './utils/safeStorage';

function AppContent() {
  const { currentOrg, currentUser, isLoading } = useAuth();
  const [currentView, setCurrentView] = useState<'landing' | 'workspace' | 'docs' | 'trust'>(() => {
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      const hash = window.location.hash;
      if (pathname.startsWith('/trust') || pathname.startsWith('/compliance') || hash.startsWith('#trust') || hash.startsWith('#compliance')) return 'trust';
      if (pathname.startsWith('/docs') || hash.startsWith('#docs')) return 'docs';
      if (
        pathname.startsWith('/admin') ||
        pathname.startsWith('/users') ||
        pathname.startsWith('/clients') ||
        pathname.startsWith('/notes') ||
        pathname.startsWith('/supervisor') ||
        pathname.startsWith('/settings') ||
        pathname.startsWith('/goalpath') ||
        pathname.startsWith('/new-note') ||
        pathname.startsWith('/engineering') ||
        pathname.startsWith('/monitoring') ||
        pathname.startsWith('/telemetry') ||
        hash.startsWith('#admin') ||
        hash.startsWith('#users') ||
        hash.startsWith('#engineering') ||
        hash.startsWith('#monitoring') ||
        hash.startsWith('#telemetry') ||
        hash === '#workspace'
      ) return 'workspace';
      if (hash === '#landing' || hash === '#checklist' || hash === '#overview') return 'landing';
      const saved = safeStorage.getItem('peernotebook_active_view');
      if (saved === 'workspace') return 'workspace';
      if (saved === 'docs') return 'docs';
      if (saved === 'trust') return 'trust';
    }
    return 'landing';
  });

  const [activeDocSlug, setActiveDocSlug] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      const hash = window.location.hash;
      if (pathname.startsWith('/docs')) {
        return pathname.replace(/^\/docs\/?/, '');
      }
      if (hash.startsWith('#docs/')) {
        return hash.replace(/^#docs\/?/, '');
      }
    }
    return '';
  });

  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [outreachOpen, setOutreachOpen] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [billingModalOpen, setBillingModalOpen] = useState(false);
  const [gatedFeatureNotice, setGatedFeatureNotice] = useState<string | null>(null);
  const { isPrivacyMode, togglePrivacyMode } = usePrivacyMode();

  useEffect(() => {
    // Check if user has completed the interactive tutorial
    const hasCompleted = safeStorage.getItem('hasCompletedTutorial') === 'true' ||
      (typeof window !== 'undefined' && window.localStorage?.getItem('hasCompletedTutorial') === 'true');
    if (!hasCompleted) {
      setTutorialOpen(true);
    }

    const handleReplayTutorial = () => {
      setTutorialOpen(true);
    };
    const handleOpenBilling = (e: Event) => {
      const customEvent = e as CustomEvent<{ notice?: string }>;
      setGatedFeatureNotice(customEvent.detail?.notice || null);
      setBillingModalOpen(true);
    };

    window.addEventListener('peernotebook:replay-tutorial', handleReplayTutorial);
    window.addEventListener('peernotebook:open-billing', handleOpenBilling as EventListener);
    return () => {
      window.removeEventListener('peernotebook:replay-tutorial', handleReplayTutorial);
      window.removeEventListener('peernotebook:open-billing', handleOpenBilling as EventListener);
    };
  }, []);

  useEffect(() => {
    const handleHashOrRoute = () => {
      const pathname = window.location.pathname;
      const hash = window.location.hash;
      if (pathname.startsWith('/trust') || pathname.startsWith('/compliance') || hash.startsWith('#trust') || hash.startsWith('#compliance')) {
        setCurrentView('trust');
      } else if (pathname.startsWith('/docs') || hash.startsWith('#docs')) {
        setCurrentView('docs');
        const slug = pathname.startsWith('/docs')
          ? pathname.replace(/^\/docs\/?/, '')
          : hash.replace(/^#docs\/?/, '');
        if (slug) setActiveDocSlug(slug);
      } else if (
        pathname.startsWith('/admin') ||
        pathname.startsWith('/users') ||
        pathname.startsWith('/clients') ||
        pathname.startsWith('/notes') ||
        pathname.startsWith('/supervisor') ||
        pathname.startsWith('/settings') ||
        pathname.startsWith('/goalpath') ||
        pathname.startsWith('/new-note') ||
        pathname.startsWith('/engineering') ||
        pathname.startsWith('/monitoring') ||
        pathname.startsWith('/telemetry') ||
        hash.startsWith('#admin') ||
        hash.startsWith('#users') ||
        hash.startsWith('#engineering') ||
        hash.startsWith('#monitoring') ||
        hash.startsWith('#telemetry') ||
        hash === '#workspace'
      ) {
        setCurrentView('workspace');
      } else if (hash === '#landing' || hash === '#overview' || hash === '#lead-magnet' || hash === '#beta-cohort') {
        setCurrentView('landing');
      }
    };
    window.addEventListener('hashchange', handleHashOrRoute);
    window.addEventListener('popstate', handleHashOrRoute);
    return () => {
      window.removeEventListener('hashchange', handleHashOrRoute);
      window.removeEventListener('popstate', handleHashOrRoute);
    };
  }, []);

  const switchView = (view: 'landing' | 'workspace' | 'docs' | 'trust', docSlug?: string) => {
    setCurrentView(view);
    if (typeof window !== 'undefined') {
      safeStorage.setItem('peernotebook_active_view', view);
      if (view === 'workspace') {
        window.location.hash = '#workspace';
      } else if (view === 'trust') {
        window.location.hash = '#trust';
      } else if (view === 'docs') {
        if (docSlug) {
          setActiveDocSlug(docSlug);
          window.location.hash = `#docs/${docSlug}`;
        } else {
          window.location.hash = '#docs';
        }
      } else {
        window.location.hash = '#overview';
      }
    }
  };

  if (currentView === 'trust') {
    return (
      <TrustCenterView
        onReturnToWorkspace={() => switchView('workspace')}
        onReturnToLanding={() => switchView('landing')}
        onOpenDocs={(slug) => switchView('docs', slug)}
      />
    );
  }

  if (currentView === 'docs') {
    return (
      <DocumentationViewer
        initialSlug={activeDocSlug}
        onReturnToWorkspace={() => switchView('workspace')}
        onReturnToLanding={() => switchView('landing')}
      />
    );
  }

  if (currentView === 'landing') {
    return (
      <LandingPage
        onLaunchApp={() => switchView('workspace')}
        onOpenDocs={(slug) => switchView('docs', slug)}
      />
    );
  }

  if (isLoading && !currentUser) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center text-slate-600 px-4">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-9 h-9 border-3 border-[#0F766E] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-mono font-medium text-slate-600">Initializing Offline Persistence Engine...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans selection:bg-[#0F766E] selection:text-white max-w-full overflow-x-hidden">
      {/* Symmetrically Aligned Top Navigation Header Navbar */}
      <Navbar
        switchView={switchView}
        onOpenOnboarding={() => setOnboardingOpen(true)}
        onOpenOutreach={() => setOutreachOpen(true)}
        onOpenAuthModal={() => setAuthModalOpen(true)}
        onOpenBillingModal={() => setBillingModalOpen(true)}
        isPrivacyMode={isPrivacyMode}
        togglePrivacyMode={togglePrivacyMode}
      />

      {/* Main Clinical Workspace */}
      <main className="flex-1 w-full max-w-full overflow-x-hidden">
        <PeerNotebookWorkspace onReplayTutorial={() => setTutorialOpen(true)} />
      </main>

      {/* Professional Trust & Compliance Footer */}
      <TrustComplianceFooter />

      {/* Interactive Tutorial Wizard Modal */}
      <InteractiveTutorialWizard
        isOpen={tutorialOpen}
        onClose={() => setTutorialOpen(false)}
        onComplete={() => setTutorialOpen(false)}
      />

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

      {/* Header Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccessRedirect={(targetRole) => {
          setAuthModalOpen(false);
          if (targetRole === 'admin') {
            window.location.hash = '#admin';
          } else if (targetRole === 'supervisor') {
            window.location.hash = '#supervisor';
          } else {
            window.location.hash = '#workspace';
          }
          switchView('workspace');
        }}
      />

      {/* Stripe Billing & 14-Day Free Trial Modal */}
      <BillingModal
        isOpen={billingModalOpen}
        onClose={() => {
          setBillingModalOpen(false);
          setGatedFeatureNotice(null);
        }}
        gatedFeatureNotice={gatedFeatureNotice}
      />

      {/* HIPAA & CMIA Privacy Consent Disclosure */}
      <PrivacyConsentBanner />
    </div>
  );
}

export default function App() {
  return (
    <FieldErrorBoundary>
      <AuthProvider>
        <PrivacyModeProvider>
          <AppContent />
        </PrivacyModeProvider>
      </AuthProvider>
    </FieldErrorBoundary>
  );
}
