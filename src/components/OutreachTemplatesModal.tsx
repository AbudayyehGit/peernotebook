/**
 * Peer Notebook - Solo Beta Test Outreach Scripts & Email Templates
 * GA #8 Milestone 1: 3-5 Person Solo Beta Test Recruitment & Onboarding
 * Ready-to-copy low-pressure message templates for peer coordinators & specialists
 */

import React, { useState } from 'react';
import {
  Mail,
  Copy,
  CheckCheck,
  X,
  MessageSquare,
  Users,
  Send,
  Sparkles,
  FileText,
  ExternalLink
} from 'lucide-react';
import { leadDigestService } from '../services/leadDigestService';

interface OutreachTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OutreachTemplatesModal: React.FC<OutreachTemplatesModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'peer' | 'supervisor' | 'contractor'>('peer');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSendingPreview, setIsSendingPreview] = useState(false);
  const [previewSentNotice, setPreviewSentNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    } catch {
      // Fallback
    }
  };

  const openInEmailClient = (subject: string, body: string) => {
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
  };

  const handleSendTestPreview = async (subject: string, body: string) => {
    setIsSendingPreview(true);
    setPreviewSentNotice(null);
    try {
      const res = await leadDigestService.testEmailDispatcher({
        to: 'support@peernotebook.com',
        templateType: 'outreach-preview',
        subject: `[Outreach Preview] ${subject}`,
        customMessage: body
      });
      setPreviewSentNotice(`Preview dispatched to support@peernotebook.com (${res.deliveryStatus.toUpperCase()} via ${res.provider})`);
      setTimeout(() => setPreviewSentNotice(null), 4000);
    } catch {
      setPreviewSentNotice('Failed to send preview email.');
    } finally {
      setIsSendingPreview(false);
    }
  };

  const templates = {
    peer: {
      id: 'template-peer-direct',
      title: 'Peer-to-Peer Colleague Outreach (Casual & Direct)',
      audience: 'Independent or agency-based Certified Peer Support Specialists (CPSS-CA)',
      subject: 'Quick question about CalAIM peer notes (testing something to save you time)',
      body: `Hi [Name],

Hope you're doing well and taking care of yourself!

I know how exhausting the CalAIM documentation transition has been lately with Medi-Cal H0038 billing codes, 15-minute unit math, and 4-part notes.

I’ve been collaborating on a lightweight, trauma-informed offline notebook called Peer Notebook (peernotebook.com). It was built specifically for California peer specialists to cut note documentation time by ~65%, calculate your billing units automatically, and keep your notes safe even when you have zero cell signal out in the field.

We are inviting just 3 to 5 solo peer specialists to try it completely free for our first pilot cohort. There’s zero sales pitch, no credit card, and no pressure—we just want real peer feedback to make sure it genuinely protects your time with clients.

Would you be open to spending 5 minutes testing a sample note this week? 

You can try it out directly right here:
https://peernotebook.com

(If you want an onboarding walkthrough or have questions, the pilot team is also available directly at support@peernotebook.com.)

Warmly,
[Your Name]
Certified Peer Support Specialist (CPSS-CA) / Peer Advocate
[Your Phone / Contact]`,
    },
    supervisor: {
      id: 'template-agency-supervisor',
      title: 'Agency Lead / Clinical Supervisor Inquiry',
      audience: 'Program Directors, Peer Supervisors & Behavioral Health Managers',
      subject: 'CalAIM H0038 documentation compliance for our peer support team',
      body: `Hello [Supervisor Name],

I wanted to share a brief update on streamlining our CalAIM Medi-Cal peer documentation. 

Under recent Department of Health Care Services (DHCS) payment reform guidelines, peer encounters require strict 4-part structure (Recovery Goal, Intervention, Client Response, Next Steps) and accurate 15-minute H0038 unit tracking across face-to-face, travel, and documentation minutes.

We’ve set up a pilot trial with Peer Notebook (peernotebook.com)—an offline-first, HIPAA-compliant PWA featuring automatic 15-minute increment calculations, digital supervisor cosigning, and tamper-evident SHA-256 audit logs (45 CFR § 164.312).

We have 3 to 5 complimentary spots open in our initial California field cohort. It allows specialists to document in field shelters or clinics without losing work, and provides clean supervisor PDF summaries ready for EHR billing. Our team can also coordinate standard Business Associate Agreements (BAA) directly via support@peernotebook.com.

Could I share a 2-minute walkthrough with you or have one of our specialists test it on 2 encounters this week?

Best regards,

[Your Name]
[Your Title & Organization]`,
    },
    contractor: {
      id: 'template-solo-contractor',
      title: 'Solo Contractor / Private Practice Peer Support Specialist',
      audience: 'Solo practitioners, community health workers, and independent navigators',
      subject: 'Free tool for solo Medi-Cal peer notes + 15-min billing checklist',
      body: `Hi [Name],

As an independent peer support specialist navigating California Medi-Cal contracts on your own, dealing with county billing audits and H0038 units can feel overwhelming without a big agency IT department.

We built Peer Notebook (peernotebook.com) specifically so solo specialists don't have to fight clumsy EHRs or Excel spreadsheets. It runs on any phone, tablet, or laptop, works completely offline, and automatically handles your 4-part note validation and billing unit conversions.

We’re onboarding 3 to 5 solo specialists for free lifetime access in our first beta cohort in exchange for simple feedback on what makes your day easier.

I've also attached our free "10-Minute Medi-Cal H0038 Note Checklist" if you just want the compliance guide for your own records:
https://peernotebook.com/#checklist

Questions or want direct support setting it up? Email the project team at support@peernotebook.com.

Let me know if you'd like an invite link!

In solidarity,
[Your Name]`,
    },
  };

  const activeTemplate = templates[activeTab];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-sm transition-opacity overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl relative my-auto space-y-5">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Close outreach templates"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1 pr-8">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#0F766E] uppercase tracking-wide">
            <Mail className="w-4 h-4 text-[#0F766E]" />
            <span>Outreach Script & Email Templates · Solo Beta Cohort</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#1E3A8A]">
            Invite 3 to 5 Solo Beta Testers
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Low-pressure, trauma-informed outreach scripts to recruit your first 3–5 independent peer specialists or program supervisors.
          </p>
        </div>

        {/* Tabs for Audiences */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setActiveTab('peer')}
            className={`min-h-[40px] px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'peer'
                ? 'bg-white text-[#1E3A8A] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Peer-to-Peer Specialist
          </button>
          <button
            onClick={() => setActiveTab('supervisor')}
            className={`min-h-[40px] px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'supervisor'
                ? 'bg-white text-[#1E3A8A] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Agency Supervisor / Lead
          </button>
          <button
            onClick={() => setActiveTab('contractor')}
            className={`min-h-[40px] px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'contractor'
                ? 'bg-white text-[#1E3A8A] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Solo / Private Contractor
          </button>
        </div>

        {/* Active Template Card */}
        <div className="p-4 sm:p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
            <div>
              <h3 className="text-sm font-bold text-[#1E3A8A]">{activeTemplate.title}</h3>
              <span className="text-xs text-slate-500">Target: {activeTemplate.audience}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => openInEmailClient(activeTemplate.subject, activeTemplate.body)}
                className="min-h-[40px] px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#1E3A8A] border border-blue-200 rounded-lg text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                title="Open directly in your default email client"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open in Mail Client</span>
              </button>
              <button
                type="button"
                onClick={() => handleSendTestPreview(activeTemplate.subject, activeTemplate.body)}
                disabled={isSendingPreview}
                className="min-h-[40px] px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-[#D97706] border border-amber-200 rounded-lg text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60"
                title="Dispatch a test preview copy to support@peernotebook.com"
              >
                <Send className={`w-3.5 h-3.5 ${isSendingPreview ? 'animate-bounce' : ''}`} />
                <span>{isSendingPreview ? 'Sending...' : 'Send Preview to Support'}</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  copyToClipboard(
                    `Subject: ${activeTemplate.subject}\n\n${activeTemplate.body}`,
                    activeTemplate.id
                  )
                }
                className="min-h-[40px] px-3.5 py-1.5 bg-[#0F766E] hover:bg-teal-800 text-white rounded-lg text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
              >
                {copiedId === activeTemplate.id ? (
                  <>
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {previewSentNotice && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-[#16A34A] font-semibold flex items-center gap-2 animate-in fade-in">
              <CheckCheck className="w-4 h-4 shrink-0 text-[#16A34A]" />
              <span>{previewSentNotice}</span>
            </div>
          )}

          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Email Subject Line:
            </span>
            <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-xs font-semibold text-slate-800">
              {activeTemplate.subject}
            </div>
          </div>

          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Message Body:
            </span>
            <pre className="p-3.5 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 whitespace-pre-wrap font-sans leading-relaxed max-h-56 overflow-y-auto">
              {activeTemplate.body}
            </pre>
          </div>
        </div>

        {/* Official Pilot Coordinator & Support Anchor */}
        <div className="p-3 bg-teal-50/70 rounded-xl border border-teal-200 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-[#0F766E] shrink-0" />
            <span className="text-slate-700 font-medium">
              Need custom pilot onboarding or BAA assistance? Reach our engineering desk:
            </span>
          </div>
          <a
            href="mailto:support@peernotebook.com"
            className="font-bold text-[#0F766E] hover:text-[#1E3A8A] hover:underline underline-offset-2 flex items-center gap-1 shrink-0"
          >
            <span>support@peernotebook.com</span>
          </a>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-slate-500 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#0F766E]" />
            Target: 3–5 committed solo beta specialists
          </span>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-6 py-2.5 bg-[#1E3A8A] hover:bg-blue-900 text-white rounded-full text-xs font-bold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
