/**
 * Peer Notebook - Verify Email Modal
 * GA #8 Standard • Lead Authenticity & HIPAA/CalAIM Email Verification
 * Strict min-h-[48px] touch targets & px-6 py-3.5 button geometry
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Mail,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  X,
  Lock,
  Sparkles
} from 'lucide-react';
import { UserRole } from '../db/peerNotebookDatabase';
import { toastService } from '../services/toastService';

interface VerifyEmailModalProps {
  isOpen: boolean;
  email: string;
  userName?: string;
  roleTitle?: string;
  targetRole?: UserRole;
  onVerified: (targetRole: UserRole) => void;
  onClose: () => void;
}

export const VerifyEmailModal: React.FC<VerifyEmailModalProps> = ({
  isOpen,
  email,
  userName = 'Colleague',
  roleTitle = 'Certified Peer Support Specialist (CPSS-CA)',
  targetRole = 'peer_specialist',
  onVerified,
  onClose
}) => {
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isVerifiedSuccess, setIsVerifiedSuccess] = useState(false);
  const [simulatedCode, setSimulatedCode] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  // Auto-send verification code on first open
  useEffect(() => {
    if (isOpen && email) {
      handleSendVerificationCode();
      setDigits(['', '', '', '', '', '']);
      setIsVerifiedSuccess(false);
      setErrorMessage(null);
    }
  }, [isOpen, email]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  if (!isOpen) return null;

  const handleSendVerificationCode = async () => {
    setIsSendingCode(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send',
          email,
          name: userName,
          roleTitle
        })
      });

      const data = await res.json();
      if (res.ok && data.ok) {
        setSuccessMessage(`Verification PIN sent to ${email}`);
        if (data.simulatedCode) {
          setSimulatedCode(data.simulatedCode);
        }
        setResendCooldown(60);
        toastService.success('PIN Dispatched', `6-digit security PIN sent to ${email}`);
      } else {
        const errorText = data.error || 'Failed to dispatch verification email. Please try again.';
        setErrorMessage(errorText);
        toastService.error('PIN Delivery Failure', errorText, data.details, data.smtpCode);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(msg || 'Network error triggering verification email.');
      toastService.error('Verification Network Error', 'Could not connect to verification server. Please verify your connection.', msg);
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleDigitChange = (index: number, value: string) => {
    const cleanVal = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...digits];
    newDigits[index] = cleanVal;
    setDigits(newDigits);
    setErrorMessage(null);

    // Auto-advance to next input
    if (cleanVal && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;

    const newDigits = [...digits];
    for (let i = 0; i < pastedData.length; i++) {
      newDigits[i] = pastedData[i];
    }
    setDigits(newDigits);
    if (pastedData.length === 6) {
      inputRefs.current[5]?.focus();
    }
  };

  const codeString = digits.join('');
  const isCodeComplete = codeString.length === 6;

  const handleVerifySubmission = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isCodeComplete) {
      setErrorMessage('Please enter the full 6-digit verification code.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify',
          email,
          code: codeString
        })
      });

      const data = await res.json();
      if (res.ok && data.ok) {
        setIsVerifiedSuccess(true);
        setTimeout(() => {
          onVerified(targetRole);
          onClose();
        }, 1200);
      } else {
        setErrorMessage(data.error || 'Invalid or expired verification code.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(msg || 'Network error verifying code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFillSimulated = () => {
    if (!simulatedCode) return;
    const split = simulatedCode.split('').slice(0, 6);
    setDigits(split);
    setErrorMessage(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full shadow-2xl relative my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header - Navy (#1E3A8A) with Trauma-Informed Styling */}
        <div className="bg-[#1E3A8A] text-white p-5 sm:p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 min-h-[44px] min-w-[44px] flex items-center justify-center text-white/70 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            title="Cancel"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-9 h-9 rounded-xl bg-[#0F766E] flex items-center justify-center text-white shadow-xs shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-teal-300 block">
                Lead Authenticity &amp; Security
              </span>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight">Verify Your Email Address</h2>
            </div>
          </div>
          <p className="text-xs text-blue-100/90 leading-relaxed mt-1">
            We sent a 6-digit confirmation PIN to verify your specialist account credentials under CalAIM &amp; CMIA standards.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4">
          {/* Target Email Banner */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-700 truncate">
              <Mail className="w-4 h-4 text-[#0F766E] shrink-0" />
              <span className="font-semibold truncate">{email}</span>
            </div>
            <span className="px-2 py-0.5 bg-teal-100 text-[#0F766E] text-[10px] font-bold rounded-full shrink-0">
              Pending
            </span>
          </div>

          {/* Feedback Alerts */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && !errorMessage && !isVerifiedSuccess && (
            <div className="p-2.5 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#0F766E] shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {isVerifiedSuccess ? (
            <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-300 text-center space-y-2 animate-in fade-in">
              <div className="w-12 h-12 bg-emerald-100 text-[#16A34A] rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Email Authenticated!</h3>
              <p className="text-xs text-slate-600">
                Your credentials are verified. Opening your Peer Notebook workspace...
              </p>
            </div>
          ) : (
            <form onSubmit={handleVerifySubmission} className="space-y-4">
              {/* 6-Digit PIN Boxes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 text-center">
                  Enter 6-Digit Verification Code
                </label>
                <div className="flex items-center justify-center gap-2 sm:gap-2.5" onPaste={handlePaste}>
                  {digits.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => { inputRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleDigitChange(i, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(i, e)}
                      className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-black font-mono text-[#1E3A8A] bg-slate-50 border-2 border-slate-300 rounded-xl focus:outline-hidden focus:border-[#0F766E] focus:bg-white transition-all shadow-2xs"
                    />
                  ))}
                </div>
                <p className="text-[11px] text-slate-500 text-center mt-2">
                  Code expires in 15 minutes. Check spam folder if not received.
                </p>
              </div>

              {/* Sandbox Quick Fill Helper if Simulated */}
              {simulatedCode && (
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-amber-800">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Demo Test PIN: <strong className="font-mono text-slate-900">{simulatedCode}</strong></span>
                  </div>
                  <button
                    type="button"
                    onClick={handleFillSimulated}
                    className="min-h-[32px] px-2.5 py-1 bg-white hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg text-[11px] font-bold cursor-pointer"
                  >
                    Auto-Fill
                  </button>
                </div>
              )}

              {/* Submit Verification Action */}
              <button
                type="submit"
                disabled={!isCodeComplete || isSubmitting}
                className={`w-full min-h-[48px] px-6 py-3.5 rounded-full text-xs sm:text-sm font-bold shadow-sm transition-all flex items-center justify-center gap-2 ${
                  isCodeComplete && !isSubmitting
                    ? 'bg-[#0F766E] hover:bg-teal-700 text-white cursor-pointer hover:shadow-md'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{isSubmitting ? 'Verifying Credentials...' : 'Verify Email & Launch Workspace'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Resend & Support Footer */}
          {!isVerifiedSuccess && (
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <button
                type="button"
                onClick={handleSendVerificationCode}
                disabled={isSendingCode || resendCooldown > 0}
                className={`flex items-center gap-1.5 font-bold cursor-pointer transition-colors ${
                  resendCooldown > 0 || isSendingCode
                    ? 'text-slate-400 cursor-not-allowed'
                    : 'text-[#0F766E] hover:underline'
                }`}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSendingCode ? 'animate-spin' : ''}`} />
                <span>
                  {resendCooldown > 0
                    ? `Resend Code in ${resendCooldown}s`
                    : isSendingCode
                    ? 'Sending...'
                    : 'Resend Verification Code'}
                </span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="text-slate-500 hover:text-slate-800 font-medium cursor-pointer"
              >
                Change Email
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
