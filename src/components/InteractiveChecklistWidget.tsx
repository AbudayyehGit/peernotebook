/**
 * Peer Notebook - Interactive Checklist Widget & Audit Tracker
 * Standards: CalAIM Medi-Cal H0038 Compliance & SDLC Delivery
 * Trauma-Informed Clinical UI • Minimum 48px Touch Targets • Zero-Pill Discipline
 * Full State Persistence via checklistStateService
 */

import React, { useState, useEffect } from 'react';
import {
  checklistStateService,
  ChecklistItem
} from '../services/checklistStateService';
import {
  CheckCircle2,
  Clock,
  RotateCcw,
  Copy,
  CheckCheck,
  X,
  Sparkles,
  ShieldCheck,
  FileText,
  Sliders,
  ExternalLink
} from 'lucide-react';

interface InteractiveChecklistWidgetProps {
  isOpen?: boolean;
  onClose?: () => void;
  isModal?: boolean;
  initialTab?: 'calaim_audit' | 'sdlc_deployment';
}

export const InteractiveChecklistWidget: React.FC<InteractiveChecklistWidgetProps> = ({
  isOpen = true,
  onClose,
  isModal = false,
  initialTab = 'calaim_audit'
}) => {
  const [activeTab, setActiveTab] = useState<'calaim_audit' | 'sdlc_deployment'>(initialTab);
  const [calaimItems, setCalaimItems] = useState<ChecklistItem[]>(checklistStateService.getCalaimChecklist());
  const [sdlcItems, setSdlcItems] = useState<ChecklistItem[]>(checklistStateService.getSdlcChecklist());
  const [copied, setCopied] = useState(false);
  const [resetNotice, setResetNotice] = useState<string | null>(null);

  const refreshState = () => {
    setCalaimItems(checklistStateService.getCalaimChecklist());
    setSdlcItems(checklistStateService.getSdlcChecklist());
  };

  useEffect(() => {
    refreshState();
    const unsubscribe = checklistStateService.subscribe(refreshState);
    return unsubscribe;
  }, []);

  if (isModal && !isOpen) return null;

  const currentItems = activeTab === 'calaim_audit' ? calaimItems : sdlcItems;
  const summary = checklistStateService.getSummary(activeTab);

  const handleToggle = (item: ChecklistItem) => {
    checklistStateService.toggleItem(activeTab, item.id);
  };

  const handleReset = () => {
    checklistStateService.resetToDefaults(activeTab);
    setResetNotice('Checklist reset to default baseline.');
    setTimeout(() => setResetNotice(null), 3000);
  };

  const handleCopyText = async () => {
    const title = activeTab === 'calaim_audit'
      ? 'THE 10-MINUTE MEDI-CAL H0038 NOTE CHECKLIST (CalAIM & CalMHSA Compliant)'
      : 'PEER NOTEBOOK - MASTER SDLC & DEPLOYMENT CHECKLIST';
    
    const lines = currentItems.map((item) => {
      const box = item.completed ? '[x]' : '[ ]';
      return `${box} ${item.title}\n    ${item.description}`;
    });

    const fullText = `${title}\nPeer Notebook (peernotebook.com)\n\n${lines.join('\n\n')}\n\nCompletion: ${summary.completed}/${summary.total} (${summary.percent}%)`;

    try {
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // safe fallback
    }
  };

  const content = (
    <div className="space-y-5">
      {/* Tab Switcher */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('calaim_audit')}
            className={`min-h-[44px] px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'calaim_audit'
                ? 'bg-[#1E3A8A] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Field Note Audit (7 Points)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sdlc_deployment')}
            className={`min-h-[44px] px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'sdlc_deployment'
                ? 'bg-[#0F766E] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            SDLC &amp; Deployment (Phases 1-6)
          </button>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={handleCopyText}
            className="min-h-[44px] px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Copy formatted checklist to clipboard"
          >
            {copied ? <CheckCheck className="w-3.5 h-3.5 text-[#16A34A]" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
            <span>{copied ? 'Copied!' : 'Copy Text'}</span>
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="min-h-[44px] px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Reset checklist to default baseline"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {resetNotice && (
        <div className="p-3 bg-teal-50 border border-teal-200 text-[#0F766E] rounded-xl text-xs font-semibold">
          {resetNotice}
        </div>
      )}

      {/* Progress Card */}
      <div className={`p-4 rounded-xl border ${
        summary.allComplete
          ? 'bg-emerald-50/90 border-emerald-200 text-emerald-900'
          : 'bg-slate-50 border-slate-200 text-slate-900'
      }`}>
        <div className="flex items-center justify-between text-xs font-bold pb-2">
          <span className="flex items-center gap-1.5 uppercase tracking-wider text-[#1E3A8A]">
            {summary.allComplete ? <CheckCircle2 className="w-4 h-4 text-[#16A34A]" /> : <Clock className="w-4 h-4 text-[#0F766E]" />}
            <span>Progress: {summary.completed} of {summary.total} Completed</span>
          </span>
          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
            summary.allComplete ? 'bg-emerald-100 text-[#16A34A]' : 'bg-blue-100 text-[#1E3A8A]'
          }`}>
            {summary.percent}% Verified
          </span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              summary.allComplete ? 'bg-[#16A34A]' : 'bg-[#0F766E]'
            }`}
            style={{ width: `${summary.percent}%` }}
          />
        </div>
      </div>

      {/* Checklist Items List */}
      <div className="space-y-3">
        {currentItems.map((item) => (
          <div
            key={item.id}
            onClick={() => handleToggle(item)}
            className={`p-4 rounded-xl border transition-all cursor-pointer select-none flex items-start gap-3.5 ${
              item.completed
                ? 'bg-emerald-50/40 border-emerald-200 hover:bg-emerald-50/70'
                : 'bg-white border-slate-200 hover:bg-slate-50 shadow-2xs'
            }`}
          >
            <div className="pt-0.5 shrink-0">
              <input
                type="checkbox"
                checked={item.completed}
                onChange={() => {}} // handled by wrapper div
                className="w-5 h-5 rounded text-[#0F766E] focus:ring-0 border-slate-300 cursor-pointer"
              />
            </div>
            <div className="space-y-1 min-w-0">
              <h4 className={`text-xs font-bold leading-snug ${
                item.completed ? 'text-[#1E3A8A] line-through opacity-85' : 'text-slate-900'
              }`}>
                {item.title}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-slate-200">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-teal-50 text-[#0F766E] rounded-xl border border-teal-200">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#1E3A8A]">Interactive Compliance &amp; Field Checklist</h3>
                <p className="text-xs text-slate-500">Persistent across browser and offline sessions</p>
              </div>
            </div>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="p-5 overflow-y-auto">
            {content}
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[48px] px-6 py-3.5 bg-[#1E3A8A] hover:bg-blue-900 text-white rounded-full text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
      {content}
    </div>
  );
};
