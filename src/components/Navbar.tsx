/**
 * Peer Notebook - Symmetrically Aligned Top Navigation Header Navbar
 * GA #8 Production Standard • Strict min-h-[48px] and px-6 py-3.5 Geometry
 * Single-Row Straight Horizontal Alignment • Zero Multi-Row Wrapping Spills
 * Consolidated Menu Drawer for Secondary Utilities • Zero Spooky Eye Icons
 */

import React, { useState } from 'react';
import {
  HeartHandshake,
  Globe,
  BookOpen,
  Sparkles,
  Mail,
  Lock,
  UserCheck,
  Menu,
  X,
  ShieldCheck,
  ShieldAlert,
  ChevronRight,
  ExternalLink,
  Layers,
  Check,
  Building2,
  Activity
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ZeroAiBadge } from './ZeroAiBadge';
import { SubscriptionStatusBadge } from './SubscriptionStatusBadge';
import { SyncStatusBadge } from './SyncStatusBadge';
import { OrgSelect } from './OrgSelect';
import { InteractiveChecklistWidget } from './InteractiveChecklistWidget';

export interface NavbarProps {
  switchView: (view: 'landing' | 'workspace' | 'docs' | 'trust' | 'sandbox', docSlug?: string) => void;
  onOpenOnboarding: () => void;
  onOpenOutreach: () => void;
  onOpenAuthModal: () => void;
  onOpenBillingModal: () => void;
  isPrivacyMode: boolean;
  togglePrivacyMode: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  switchView,
  onOpenOnboarding,
  onOpenOutreach,
  onOpenAuthModal,
  onOpenBillingModal,
  isPrivacyMode,
  togglePrivacyMode
}) => {
  const { currentUser } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isChecklistOpen, setIsChecklistOpen] = useState(false);

  const getAuthButtonLabel = () => {
    if (!currentUser) return 'Login';
    if (currentUser.role === 'super_admin') return 'Super Admin';
    if (currentUser.role === 'admin') return 'Admin';
    if (currentUser.role === 'supervisor') return 'Supervisor';
    return 'Specialist';
  };

  return (
    <>
      <header className="bg-[#1E3A8A] border-b border-blue-950 sticky top-0 z-40 shadow-sm text-white w-full max-w-full overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between gap-4 w-full">
          {/* Zone 1: Logo & Brand Identity (Left) */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => switchView('landing')}
              className="min-h-[48px] flex items-center gap-2.5 sm:gap-3 hover:opacity-95 transition-opacity cursor-pointer text-left"
              title="Return to Landing Page & Checklist"
            >
              <div className="w-10 h-10 rounded-xl bg-[#0F766E] flex items-center justify-center text-white shadow-sm ring-1 ring-white/20 shrink-0">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div className="flex flex-col justify-center">
                <div className="flex items-center gap-2">
                  <span className="text-base sm:text-lg font-bold text-white tracking-tight leading-tight">
                    Peer Notebook
                  </span>
                  <span className="hidden sm:inline-flex text-[11px] font-mono px-2 py-0.5 rounded-md bg-blue-800/90 border border-blue-700/80 text-blue-100 font-semibold shrink-0">
                    CalAIM H0038
                  </span>
                </div>
                <p className="hidden md:block text-xs text-blue-200/90 leading-tight mt-0.5 truncate max-w-xs lg:max-w-md">
                  Medi-Cal Peer Documentation
                </p>
              </div>
            </button>
          </div>

          {/* Zone 2: Desktop Clean Navigation Links (Center) */}
          <nav className="hidden lg:flex items-center gap-3">
            <button
              onClick={() => switchView('landing')}
              className="min-h-[48px] px-5 py-3.5 rounded-full bg-blue-900/60 hover:bg-blue-800 text-blue-100 border border-blue-700/60 flex items-center justify-center gap-2 text-xs sm:text-sm font-bold transition-colors cursor-pointer shadow-xs"
            >
              <Globe className="w-4 h-4 text-teal-300" />
              <span>Landing &amp; Checklist</span>
            </button>
            <button
              onClick={() => switchView('sandbox')}
              className="min-h-[48px] px-5 py-3.5 rounded-full bg-[#0F766E]/90 hover:bg-[#0F766E] text-white border border-teal-400/60 flex items-center justify-center gap-2 text-xs sm:text-sm font-bold transition-colors cursor-pointer shadow-xs"
              title="Frictionless 1099 Contractor Note Sandbox (No Login Required)"
            >
              <Sparkles className="w-4 h-4 text-teal-200" />
              <span>Free Sandbox (1099)</span>
            </button>
            <button
              onClick={() => switchView('docs')}
              className="min-h-[48px] px-5 py-3.5 rounded-full bg-blue-900/60 hover:bg-blue-800 text-blue-100 border border-blue-700/60 flex items-center justify-center gap-2 text-xs sm:text-sm font-bold transition-colors cursor-pointer shadow-xs"
            >
              <BookOpen className="w-4 h-4 text-teal-300" />
              <span>Docs Hub (27)</span>
            </button>
          </nav>

          {/* Zone 3: Symmetrically Straightened Action Controls (Right - Strictly 1 Single Row) */}
          <div className="flex items-center justify-end gap-2.5 sm:gap-3 shrink-0">
            {/* Plain-English Offline / Cloud Sync Status Badge */}
            <div className="hidden xs:flex items-center">
              <SyncStatusBadge />
            </div>

            {/* Primary Login / RBAC Switcher Button - Strict min-h-[48px] px-6 py-3.5 */}
            <button
              type="button"
              onClick={onOpenAuthModal}
              className="min-h-[48px] px-6 py-3.5 text-xs sm:text-sm font-bold bg-[#0F766E] hover:bg-teal-700 text-white rounded-full border border-teal-500/60 transition-colors shrink-0 flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-95"
              title="Sign In with Credentials or Switch Active Role"
            >
              {currentUser ? <UserCheck className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              <span>{getAuthButtonLabel()}</span>
            </button>

            {/* Consolidated Professional Burger Menu Button - Strict min-h-[48px] */}
            <button
              type="button"
              onClick={() => setIsMenuOpen(true)}
              className="min-h-[48px] px-4 sm:px-5 py-3.5 rounded-full bg-blue-900/70 hover:bg-blue-800 text-white border border-blue-700/80 flex items-center justify-center gap-2 text-xs sm:text-sm font-bold transition-colors cursor-pointer shadow-xs"
              title="Open Navigation Menu & Utilities"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-4 h-4 text-teal-300" />
              <span className="hidden sm:inline">Menu</span>
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================================
          CONSOLIDATED BURGER DRAWER MODAL (Strict Light-Slate Overlay z-50)
          Consolidates all secondary controls without crowding the main hero header
          ========================================================================= */}
      {isMenuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-start sm:items-center justify-center sm:justify-end p-0 sm:p-4 bg-slate-900/50 backdrop-blur-xs transition-opacity overflow-y-auto"
        >
          {/* Backdrop Click Dismiss */}
          <div className="fixed inset-0" onClick={() => setIsMenuOpen(false)} />

          {/* Drawer Panel */}
          <div className="relative bg-white border border-slate-200 w-full sm:max-w-md h-full sm:h-auto sm:max-h-[92vh] sm:rounded-3xl shadow-2xl overflow-y-auto z-10 flex flex-col justify-between text-slate-800">
            {/* Drawer Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#1E3A8A] flex items-center justify-center text-white shadow-xs">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1E3A8A]">Navigation &amp; Controls</h3>
                  <p className="text-xs text-slate-500">Peer Notebook Master Workspace</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsMenuOpen(false)}
                className="min-h-[48px] min-w-[48px] p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/80 rounded-xl flex items-center justify-center transition-colors cursor-pointer"
                title="Close Menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body Items */}
            <div className="p-5 sm:p-6 space-y-5 flex-1 overflow-y-auto">
              {/* 1. Active Account & Agency Profile Selector */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/90 space-y-2.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  Active Clinical Profile
                </span>
                <div className="flex items-center justify-between">
                  <OrgSelect />
                </div>
              </div>

              {/* 2. Stripe 14-Day Free Trial & Subscription Tier */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/90 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Billing &amp; Subscription
                  </span>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onOpenBillingModal();
                    }}
                    className="text-xs font-bold text-[#0F766E] hover:underline"
                  >
                    Manage
                  </button>
                </div>
                <div>
                  <SubscriptionStatusBadge onOpenBillingModal={() => {
                    setIsMenuOpen(false);
                    onOpenBillingModal();
                  }} />
                </div>
              </div>

              {/* 3. Field Privacy Mode (De-identification) Switch */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/90 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-[#1E3A8A] block">
                      Zero-Trust Client Masking
                    </span>
                    <p className="text-[11px] text-slate-500 leading-tight">
                      Masks names into secure pseudonyms (e.g. "Client #A849") in public spaces.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={togglePrivacyMode}
                    className={`min-h-[44px] px-4 py-2 rounded-full text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                      isPrivacyMode
                        ? 'bg-amber-100 text-amber-900 border-amber-300'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {isPrivacyMode ? 'Masked' : 'Normal'}
                  </button>
                </div>
              </div>

              {/* 4. Quick Navigation Links */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  Workspace Navigation
                </span>

                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    switchView('landing');
                  }}
                  className="w-full min-h-[48px] px-4 py-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs sm:text-sm font-bold flex items-center justify-between transition-colors text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Globe className="w-4 h-4 text-[#0F766E]" />
                    <span>Landing Page &amp; Checklist</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    switchView('docs');
                  }}
                  className="w-full min-h-[48px] px-4 py-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs sm:text-sm font-bold flex items-center justify-between transition-colors text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <BookOpen className="w-4 h-4 text-[#0F766E]" />
                    <span>Documentation Hub (27 Docs)</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onOpenOnboarding();
                  }}
                  className="w-full min-h-[48px] px-4 py-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs sm:text-sm font-bold flex items-center justify-between transition-colors text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>2-Min Guided Walkthrough</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onOpenOutreach();
                  }}
                  className="w-full min-h-[48px] px-4 py-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs sm:text-sm font-bold flex items-center justify-between transition-colors text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Mail className="w-4 h-4 text-[#0F766E]" />
                    <span>Beta Outreach Email Scripts</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    switchView('workspace');
                    setTimeout(() => {
                      window.location.hash = '#admin/dashboard';
                    }, 50);
                  }}
                  className="w-full min-h-[48px] px-4 py-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs sm:text-sm font-bold flex items-center justify-between transition-colors text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Building2 className="w-4 h-4 text-[#1E3A8A]" />
                    <span>CBO Admin Dashboard</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    switchView('workspace');
                    setTimeout(() => {
                      window.location.hash = '#telemetry';
                    }, 50);
                  }}
                  className="w-full min-h-[48px] px-4 py-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs sm:text-sm font-bold flex items-center justify-between transition-colors text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Activity className="w-4 h-4 text-emerald-600" />
                    <span>Engineering Telemetry Portal</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsChecklistOpen(true);
                  }}
                  className="w-full min-h-[48px] px-4 py-3 rounded-xl bg-teal-50/70 hover:bg-teal-100/70 border border-teal-200 text-[#0F766E] text-xs sm:text-sm font-bold flex items-center justify-between transition-colors text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-[#0F766E]" />
                    <span>Interactive Compliance Checklist</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-teal-400" />
                </button>
              </div>

              {/* 5. Zero-AI Compliance Badge in Drawer */}
              <div className="pt-2">
                <ZeroAiBadge variant="footer" />
              </div>
            </div>

            {/* Drawer Footer CTA */}
            <div className="p-5 sm:p-6 border-t border-slate-100 bg-slate-50/80">
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onOpenAuthModal();
                }}
                className="w-full min-h-[48px] px-6 py-3.5 bg-[#0F766E] hover:bg-teal-800 text-white rounded-full text-xs sm:text-sm font-bold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>{currentUser ? 'Switch Role or Sign Out' : 'Sign In with Credentials'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Compliance Checklist Modal */}
      <InteractiveChecklistWidget
        isModal
        isOpen={isChecklistOpen}
        onClose={() => setIsChecklistOpen(false)}
      />
    </>
  );
};

export default Navbar;
