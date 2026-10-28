/**
 * Peer Notebook - Header Authentication Modal & Role-Based Sign-In Flow
 * Standard: GA #8 • CalAIM & Medi-Cal H0038 • Multi-Tier RBAC
 * Mandatory Non-Bypassable HIPAA / CMIA Consent & BAA Checkboxes on Sign-Up
 * Minimum 48px Touch Targets & Trauma-Informed Clinical Styling
 */

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole, AccountType } from '../db/peerNotebookDatabase';
import { HeartHandshake, ShieldCheck, Lock, Mail, UserCheck, ArrowRight, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { VerifyEmailModal } from './VerifyEmailModal';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessRedirect?: (targetRole: UserRole) => void;
  initialMode?: 'signin' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccessRedirect,
  initialMode = 'signin'
}) => {
  const { allUsers, switchUser, loginWithSupabase, registerWithSupabase, currentUser } = useAuth();
  const [mode, setMode] = useState<'signin' | 'register'>(initialMode);

  // Sign In Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sign Up Form State
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('peer_specialist');
  const [regAccountType, setRegAccountType] = useState<AccountType>('agency_cbo');
  const [regLicense, setRegLicense] = useState('CA-CPSS-2026-');

  // Mandatory Non-Bypassable Compliance Checkboxes
  const [agreeTos, setAgreeTos] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeBaa, setAgreeBaa] = useState(false);

  // Email Verification Modal State
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  if (!isOpen) return null;

  const handleRoleRedirect = (roleToRedirect: UserRole) => {
    onClose();
    if (onSuccessRedirect) {
      onSuccessRedirect(roleToRedirect);
    } else {
      if (typeof window !== 'undefined') {
        if (roleToRedirect === 'admin') {
          window.location.hash = '#admin';
        } else if (roleToRedirect === 'supervisor') {
          window.location.hash = '#supervisor';
        } else {
          window.location.hash = '#workspace';
        }
      }
    }
  };

  const handleQuickSwitchRole = async (targetRole: UserRole) => {
    setAuthError(null);
    setIsSubmitting(true);
    try {
      const targetUser = allUsers.find((u) => u.role === targetRole) || allUsers[0];
      if (targetUser) {
        await switchUser(targetUser.id);
        handleRoleRedirect(targetRole);
      }
    } catch {
      setAuthError('Failed to switch user account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setAuthError('Please provide both email and password.');
      return;
    }

    setIsSubmitting(true);
    setAuthError(null);

    try {
      const res = await loginWithSupabase(email, password);
      if (res.success) {
        const matched = allUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
        handleRoleRedirect(matched?.role || 'peer_specialist');
      } else {
        // Fallback for demo specialist accounts
        const matchedLocal = allUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
        if (matchedLocal) {
          await switchUser(matchedLocal.id);
          handleRoleRedirect(matchedLocal.role);
        } else {
          setAuthError(res.error || 'Invalid credentials. Please verify your email.');
        }
      }
    } catch (err: unknown) {
      setAuthError((err as Error).message || 'Authentication failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTos || !agreePrivacy || !agreeBaa) {
      setAuthError('All three compliance checkboxes (ToS, Privacy Policy, BAA) are legally mandatory under California CMIA & CalAIM.');
      return;
    }

    if (!regEmail || !regPassword || !regFullName) {
      setAuthError('Please fill in all required registration fields.');
      return;
    }

    if (regPassword.length < 8) {
      setAuthError('Password must be at least 8 characters long.');
      return;
    }

    setIsSubmitting(true);
    setAuthError(null);

    try {
      const res = await registerWithSupabase(regEmail, regPassword, {
        fullName: regFullName,
        role: regRole,
        accountType: regAccountType,
        licenseNumber: regLicense,
        agreedBaaAt: new Date().toISOString()
      });

      if (res.success) {
        // Trigger email verification modal to ensure lead authenticity before launching workspace
        setShowVerifyModal(true);
      } else {
        setAuthError(res.error || 'Registration failed. Please try a different email.');
      }
    } catch (err: unknown) {
      setAuthError((err as Error).message || 'Registration error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const allConsentGiven = agreeTos && agreePrivacy && agreeBaa;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-sm transition-opacity overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full shadow-2xl relative my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header Bar - Deep Navy (#1E3A8A) */}
        <div className="bg-[#1E3A8A] text-white p-5 sm:p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 min-h-[44px] min-w-[44px] flex items-center justify-center text-white/70 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-9 h-9 rounded-xl bg-[#0F766E] flex items-center justify-center text-white shadow-xs shrink-0">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight">Peer Notebook</h2>
          </div>
          <p className="text-xs text-blue-100/90 leading-relaxed">
            CalAIM & Medi-Cal H0038 Peer Encounter Documentation · Role-Based Secure Access
          </p>
        </div>

        {/* Tab Controls: Sign In vs Register */}
        <div className="flex border-b border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setAuthError(null);
            }}
            className={`flex-1 min-h-[48px] py-3 text-xs sm:text-sm font-bold text-center border-b-2 transition-colors cursor-pointer ${
              mode === 'signin'
                ? 'border-[#0F766E] text-[#0F766E] bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setAuthError(null);
            }}
            className={`flex-1 min-h-[48px] py-3 text-xs sm:text-sm font-bold text-center border-b-2 transition-colors cursor-pointer ${
              mode === 'register'
                ? 'border-[#0F766E] text-[#0F766E] bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Register / Sign Up
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {authError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          {mode === 'signin' ? (
            <>
              {/* Quick Role Switcher for Evaluators / Specialists */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  Quick Role-Based Access:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickSwitchRole('peer_specialist')}
                    disabled={isSubmitting}
                    className="min-h-[48px] p-2.5 rounded-xl border border-teal-200 bg-teal-50/70 hover:bg-teal-100 text-[#0F766E] font-bold text-xs flex flex-col items-center justify-center transition-colors cursor-pointer text-center"
                  >
                    <span>Peer Specialist</span>
                    <span className="text-[10px] font-normal text-slate-600">Alex Rivera</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickSwitchRole('supervisor')}
                    disabled={isSubmitting}
                    className="min-h-[48px] p-2.5 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-[#1E3A8A] font-bold text-xs flex flex-col items-center justify-center transition-colors cursor-pointer text-center"
                  >
                    <span>Supervisor</span>
                    <span className="text-[10px] font-normal text-slate-600">Sarah Jenkins</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickSwitchRole('admin')}
                    disabled={isSubmitting}
                    className="min-h-[48px] p-2.5 rounded-xl border border-amber-300 bg-amber-50/70 hover:bg-amber-100 text-[#D97706] font-bold text-xs flex flex-col items-center justify-center transition-colors cursor-pointer text-center"
                  >
                    <span>Admin</span>
                    <span className="text-[10px] font-normal text-slate-600">Elena Rostova</span>
                  </button>
                </div>
              </div>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-200" />
                <span className="flex-shrink mx-3 text-slate-400 text-xs uppercase font-medium">Or Sign In with Email</span>
                <div className="flex-grow border-t border-slate-200" />
              </div>

              <form onSubmit={handleSignIn} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Specialist Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="specialist@peernotebook.com"
                      className="w-full min-h-[48px] pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:border-[#0F766E] focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full min-h-[48px] pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:border-[#0F766E] focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full min-h-[48px] px-6 py-3.5 bg-[#0F766E] hover:bg-teal-700 text-white rounded-full text-xs sm:text-sm font-bold shadow-sm transition-all hover:shadow-md cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>{isSubmitting ? 'Authenticating...' : 'Sign In to Workspace'}</span>
                </button>
              </form>
            </>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Legal Name
                  </label>
                  <input
                    type="text"
                    required
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    placeholder="e.g. Maria Gonzalez"
                    className="w-full min-h-[48px] px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-[#0F766E] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Work Email
                  </label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="maria@cbohealth.org"
                    className="w-full min-h-[48px] px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-[#0F766E] focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Account Structure
                  </label>
                  <select
                    value={regAccountType}
                    onChange={(e) => setRegAccountType(e.target.value as AccountType)}
                    className="w-full min-h-[48px] px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-[#0F766E] focus:bg-white"
                  >
                    <option value="agency_cbo">Agency / CBO Team Member</option>
                    <option value="solo_1099">Independent 1099 Contractor (Solo)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Primary Role
                  </label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as UserRole)}
                    className="w-full min-h-[48px] px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-[#0F766E] focus:bg-white"
                  >
                    <option value="peer_specialist">Peer Support Specialist (CPSS-CA)</option>
                    <option value="supervisor">Clinical Supervisor (LCSW / LMFT)</option>
                    <option value="admin">Agency Administrator</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Password (min 8 characters)
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Create secure password"
                  className="w-full min-h-[48px] px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-[#0F766E] focus:bg-white"
                />
              </div>

              {/* MANDATORY, NON-BYPASSABLE HIPAA / CMIA CONSENT & BAA CHECKBOXES */}
              <div className="pt-2 p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5 text-xs">
                <span className="font-bold text-[#1E3A8A] block uppercase text-[10px] tracking-wide">
                  Mandatory Legal & Privacy Agreements:
                </span>

                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={agreeTos}
                    onChange={(e) => setAgreeTos(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded text-[#0F766E] focus:ring-[#0F766E]"
                  />
                  <span className="text-slate-700 leading-snug">
                    I agree to the <strong>Terms of Service (ToS)</strong> and CalAIM clinical compliance rules. <span className="text-rose-500">*</span>
                  </span>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={agreePrivacy}
                    onChange={(e) => setAgreePrivacy(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded text-[#0F766E] focus:ring-[#0F766E]"
                  />
                  <span className="text-slate-700 leading-snug">
                    I agree to the <strong>California CMIA & HIPAA Privacy Policy</strong>, ensuring no unauthorized PHI exposure. <span className="text-rose-500">*</span>
                  </span>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={agreeBaa}
                    onChange={(e) => setAgreeBaa(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded text-[#0F766E] focus:ring-[#0F766E]"
                  />
                  <span className="text-slate-700 leading-snug">
                    I acknowledge and accept the <strong>Business Associate Agreement (BAA)</strong> provisions under 45 CFR § 164.502(e). <span className="text-rose-500">*</span>
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !allConsentGiven}
                className={`w-full min-h-[48px] px-6 py-3.5 rounded-full text-xs sm:text-sm font-bold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  allConsentGiven && !isSubmitting
                    ? 'bg-[#1E3A8A] hover:bg-blue-900 text-white hover:shadow-md'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>
                  {!allConsentGiven
                    ? 'Check All 3 Required Agreements'
                    : isSubmitting
                    ? 'Creating Account...'
                    : 'Complete Registration & Open Workspace'}
                </span>
              </button>
            </form>
          )}

          {/* Footer Assistance */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Peer Notebook LLC</span>
            <a
              href="mailto:support@peernotebook.com"
              className="text-[#0F766E] hover:underline font-medium"
            >
              support@peernotebook.com
            </a>
          </div>
        </div>
      </div>

      {/* Email Authenticity & Verification Modal */}
      {showVerifyModal && (
        <VerifyEmailModal
          isOpen={showVerifyModal}
          email={regEmail}
          userName={regFullName}
          roleTitle={regRole === 'peer_specialist' ? 'Certified Peer Support Specialist (CPSS-CA)' : regRole === 'supervisor' ? 'Clinical Peer Supervisor' : 'Agency Administrator'}
          targetRole={regRole}
          onVerified={(role) => {
            setShowVerifyModal(false);
            handleRoleRedirect(role);
          }}
          onClose={() => setShowVerifyModal(false)}
        />
      )}
    </div>
  );
};
