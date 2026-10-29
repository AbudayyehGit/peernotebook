/**
 * Peer Notebook - Beta Tester Onboarding Modal & 2-Minute Walkthrough
 * GA #8 Solo Beta Trial (3-5 Specialists) • Trauma-Informed Clinical UI
 * Soft Slate (#F8FAFC), Deep Navy (#1E3A8A), Muted Teal (#0F766E), Green (#16A34A)
 */

import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  FileText,
  Shield,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  X,
  FileCheck,
  Zap,
  Check,
  Mail,
  Building2,
  Briefcase
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface BetaOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartFirstNote: () => void;
}

export const BetaOnboardingModal: React.FC<BetaOnboardingModalProps> = ({
  isOpen,
  onClose,
  onStartFirstNote,
}) => {
  const { currentUser, updateContractorSettings } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [employmentType, setEmploymentType] = useState<'w2_employee' | '1099_contractor'>(
    currentUser?.isContractor1099 ? '1099_contractor' : 'w2_employee'
  );

  const handleSelectEmployment = async (type: 'w2_employee' | '1099_contractor') => {
    setEmploymentType(type);
    try {
      await updateContractorSettings({
        isContractor1099: type === '1099_contractor',
        hourlyContractRate: type === '1099_contractor' ? 45 : undefined,
        mileageReimbursementRate: type === '1099_contractor' ? 0.67 : undefined
      });
    } catch {
      // ignore
    }
  };

  if (!isOpen) return null;

  const steps = [
    {
      stepNumber: '01',
      title: 'Select or Create a Client',
      subtitle: 'Pseudonymized & HIPAA Compliant',
      icon: <Shield className="w-5 h-5 text-[#0F766E]" />,
      description:
        'Client records are protected under California CMIA and HIPAA. Each peer is identified with a privacy-preserving code (e.g., PN-7821) and preferred name.',
      keyPoints: [
        'No unencrypted PHI stored in plain text',
        'Pre-configured CalAIM recovery goals',
        'Works 100% offline in client homes or drop-in centers'
      ],
      timeEstimate: '30 seconds'
    },
    {
      stepNumber: '02',
      title: 'The 4-Part CalAIM Note',
      subtitle: 'Deterministic, Audit-Proof Structure',
      icon: <FileText className="w-5 h-5 text-[#1E3A8A]" />,
      description:
        'Eliminate writer’s block. California DHCS requires four exact components: Recovery Goal, Peer Intervention, Client Response, and Plan/Next Steps.',
      keyPoints: [
        'Built-in peer coaching prompts and focus domains',
        'Uses the client’s own words for trauma-informed dignity',
        'Validated against CalMHSA Medi-Cal billing standards'
      ],
      timeEstimate: '60 seconds'
    },
    {
      stepNumber: '03',
      title: 'H0038 15-Minute Billing Math',
      subtitle: 'Automatic Unit Calculation',
      icon: <Clock className="w-5 h-5 text-[#0F766E]" />,
      description:
        'Enter your encounter times. Peer Notebook automatically computes your face-to-face, travel, and documentation minutes into exact 15-minute billing units.',
      keyPoints: [
        '8–22 min = 1 Unit · 23–37 min = 2 Units · 38–52 min = 3 Units',
        'Separates direct peer support from travel and documentation time',
        'Prevents costly claim denials and supervisor kickbacks'
      ],
      timeEstimate: '15 seconds'
    },
    {
      stepNumber: '04',
      title: 'Sign & Instant IndexedDB Lock',
      subtitle: 'Immutable Local & Cloud Sync',
      icon: <FileCheck className="w-5 h-5 text-[#16A34A]" />,
      description:
        'Sign with your CPSS-CA credential. Your note is locked into client-side IndexedDB immediately and synced to Supabase with SHA-256 audit logs.',
      keyPoints: [
        'Electronic specialist signature with timestamp',
        'One-click supervisor submission workflow',
        'Instant printable PDF for county billing records'
      ],
      timeEstimate: '15 seconds'
    }
  ];

  const step = steps[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-sm transition-opacity overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 sm:p-7 shadow-2xl relative my-auto space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Close walkthrough"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1 pr-8">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#0F766E] uppercase tracking-wide">
            <Sparkles className="w-4 h-4 text-[#0F766E]" />
            <span>Solo Beta Tester Quickstart · 2-Minute First Note</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#1E3A8A]">
            Master CalAIM Documentation
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Follow this 4-step walkthrough designed to eliminate documentation anxiety and ensure complete Medi-Cal audit readiness.
          </p>
        </div>

        {/* 1099 vs. W-2 Clinical Classification Toggle */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              Your Specialist Classification
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              {employmentType === 'w2_employee' ? 'Agency Payroll & Cosigning' : 'IRS $0.67/mi & 1099 Rates'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleSelectEmployment('w2_employee')}
              className={`min-h-[44px] px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                employmentType === 'w2_employee'
                  ? 'bg-white text-[#1E3A8A] shadow-xs ring-1 ring-slate-300'
                  : 'text-slate-600 hover:text-slate-900 bg-slate-100'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>W-2 Agency Employee</span>
            </button>
            <button
              type="button"
              onClick={() => handleSelectEmployment('1099_contractor')}
              className={`min-h-[44px] px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                employmentType === '1099_contractor'
                  ? 'bg-white text-amber-900 shadow-xs ring-1 ring-amber-300'
                  : 'text-slate-600 hover:text-slate-900 bg-slate-100'
              }`}
            >
              <Briefcase className="w-4 h-4 text-amber-600" />
              <span>1099 Independent Contractor</span>
            </button>
          </div>
        </div>

        {/* Progress Stepper */}
        <div className="grid grid-cols-4 gap-2 pt-1">
          {steps.map((s, idx) => (
            <button
              key={s.stepNumber}
              onClick={() => setCurrentStep(idx)}
              className={`text-left p-2 rounded-xl border transition-all cursor-pointer ${
                idx === currentStep
                  ? 'bg-blue-50/80 border-[#1E3A8A] text-[#1E3A8A]'
                  : idx < currentStep
                  ? 'bg-emerald-50/70 border-emerald-300 text-[#16A34A]'
                  : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span>Step {s.stepNumber}</span>
                {idx < currentStep && <Check className="w-3.5 h-3.5 text-[#16A34A]" />}
              </div>
              <span className="text-[11px] truncate block font-medium mt-0.5">
                {s.title.split(' ')[0]}
              </span>
            </button>
          ))}
        </div>

        {/* Step Card Content */}
        <div className="p-5 bg-slate-50/80 rounded-2xl border border-slate-200/90 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs shrink-0">
                {step.icon}
              </div>
              <div>
                <h3 className="text-base font-bold text-[#1E3A8A]">{step.title}</h3>
                <span className="text-xs text-[#0F766E] font-medium">{step.subtitle}</span>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-full text-[11px] font-semibold text-slate-600 shrink-0">
              ⏱ {step.timeEstimate}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            {step.description}
          </p>

          <div className="space-y-2 pt-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              What Peer Notebook Handles:
            </span>
            <ul className="space-y-1.5">
              {step.keyPoints.map((pt, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] shrink-0 mt-0.5" />
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Dedicated Support & Pilot Help Anchor */}
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span className="flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-[#0F766E]" />
            <span>Need pilot onboarding help?</span>
          </span>
          <a
            href="mailto:support@peernotebook.com"
            className="font-bold text-[#0F766E] hover:text-[#1E3A8A] hover:underline"
          >
            support@peernotebook.com
          </a>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-between gap-3 pt-1">
          <button
            type="button"
            onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
            disabled={currentStep === 0}
            className="min-h-[44px] px-4 py-2 border border-slate-300 rounded-full text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          {currentStep < steps.length - 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => Math.min(steps.length - 1, prev + 1))}
              className="min-h-[44px] px-6 py-2.5 bg-[#1E3A8A] hover:bg-blue-900 text-white rounded-full text-xs font-bold shadow-sm transition-colors flex items-center gap-2 cursor-pointer"
            >
              <span>Next: Step {steps[currentStep + 1].stepNumber}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                onClose();
                onStartFirstNote();
              }}
              className="min-h-[44px] px-6 py-2.5 bg-[#0F766E] hover:bg-teal-800 text-white rounded-full text-xs font-bold shadow-md transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Zap className="w-4 h-4" />
              <span>Launch First Note in Workspace</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
