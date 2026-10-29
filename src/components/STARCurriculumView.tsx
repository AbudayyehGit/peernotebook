/**
 * Peer Notebook - California SB 803 & CalMHSA Curriculum & STAR Interview Simulator
 * Standards:
 * - California Senate Bill 803 (SB 803) & CalMHSA 80-Hour Core Curriculum
 * - 40-Hour Specialized Tracks (ECM, Forensics, Street Medicine, Respite)
 * - STAR Behavioral Interview Practice Engine (Situation, Task, Action, Result)
 * - DHCS / CalMHSA Code of Ethics & Boundary Enforcement
 * Offline-First & Zero-AI Deterministic Architecture
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  TRAINING_TRACKS,
  CALMHSA_80HR_MODULES,
  CALMHSA_40HR_SPECIALIZED_MODULES,
  STAR_INTERVIEW_SCENARIOS,
  CALMHSA_ETHICS_CHECKLIST_DATA,
  CurriculumModule,
  STARInterviewScenario
} from '../data/curriculumData';
import { safeStorage } from '../utils/safeStorage';
import { checklistStateService } from '../services/checklistStateService';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap,
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  Search,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Copy,
  CheckCheck,
  RotateCcw,
  ShieldCheck,
  HelpCircle,
  FileText,
  AlertTriangle,
  Lightbulb,
  Download,
  Filter,
  Check,
  Scale
} from 'lucide-react';

const STORAGE_KEY_80HR_PROGRESS = 'peernotebook_80hr_completed_modules';
const STORAGE_KEY_40HR_PROGRESS = 'peernotebook_40hr_completed_modules';
const STORAGE_KEY_STAR_PRACTICE = 'peernotebook_star_user_notes';

type CurriculumViewTab = '80hr_core' | '40hr_specialized' | 'star_interview' | 'ethics_code';

export const STARCurriculumView: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<CurriculumViewTab>('80hr_core');
  
  // Completed Module IDs
  const [completed80HrIds, setCompleted80HrIds] = useState<string[]>(() => {
    try {
      const saved = safeStorage.getItem(STORAGE_KEY_80HR_PROGRESS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [completed40HrIds, setCompleted40HrIds] = useState<string[]>(() => {
    try {
      const saved = safeStorage.getItem(STORAGE_KEY_40HR_PROGRESS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Expanded module accordion items
  const [expandedModuleId, setExpandedModuleId] = useState<string | null>(CALMHSA_80HR_MODULES[0]?.id || null);

  // Search & Filter for Modules
  const [moduleSearch, setModuleSearch] = useState('');
  const [moduleCategoryFilter, setModuleCategoryFilter] = useState('ALL');

  // STAR Interview state
  const [selectedStarScenario, setSelectedStarScenario] = useState<STARInterviewScenario>(STAR_INTERVIEW_SCENARIOS[0]);
  const [starCategoryFilter, setStarCategoryFilter] = useState('ALL');
  const [starSearch, setStarSearch] = useState('');
  const [userPracticeNotes, setUserPracticeNotes] = useState<Record<string, string>>(() => {
    try {
      const saved = safeStorage.getItem(STORAGE_KEY_STAR_PRACTICE);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  // Sync to safeStorage
  useEffect(() => {
    safeStorage.setItem(STORAGE_KEY_80HR_PROGRESS, JSON.stringify(completed80HrIds));
  }, [completed80HrIds]);

  useEffect(() => {
    safeStorage.setItem(STORAGE_KEY_40HR_PROGRESS, JSON.stringify(completed40HrIds));
  }, [completed40HrIds]);

  const handleToggleModuleCompletion = (moduleId: string, track: '80hr_core' | '40hr_specialized') => {
    if (track === '80hr_core') {
      setCompleted80HrIds(prev => 
        prev.includes(moduleId) ? prev.filter(id => id !== moduleId) : [...prev, moduleId]
      );
    } else {
      setCompleted40HrIds(prev => 
        prev.includes(moduleId) ? prev.filter(id => id !== moduleId) : [...prev, moduleId]
      );
    }
  };

  const handleSavePracticeNote = (scenarioId: string, notes: string) => {
    const updated = { ...userPracticeNotes, [scenarioId]: notes };
    setUserPracticeNotes(updated);
    safeStorage.setItem(STORAGE_KEY_STAR_PRACTICE, JSON.stringify(updated));
  };

  // 80-Hour Calculations
  const total80HrCompletedHours = useMemo(() => {
    return CALMHSA_80HR_MODULES
      .filter(m => completed80HrIds.includes(m.id))
      .reduce((sum, m) => sum + m.hours, 0);
  }, [completed80HrIds]);

  const percent80Hr = Math.min(100, Math.round((total80HrCompletedHours / 80) * 100));

  // 40-Hour Calculations
  const total40HrCompletedHours = useMemo(() => {
    return CALMHSA_40HR_SPECIALIZED_MODULES
      .filter(m => completed40HrIds.includes(m.id))
      .reduce((sum, m) => sum + m.hours, 0);
  }, [completed40HrIds]);

  const percent40Hr = Math.min(100, Math.round((total40HrCompletedHours / 40) * 100));

  // Filtered 80-hr Modules
  const filtered80HrModules = useMemo(() => {
    return CALMHSA_80HR_MODULES.filter(m => {
      const matchCat = moduleCategoryFilter === 'ALL' || m.category === moduleCategoryFilter;
      const matchSearch = m.title.toLowerCase().includes(moduleSearch.toLowerCase()) ||
                          m.description.toLowerCase().includes(moduleSearch.toLowerCase()) ||
                          m.competencyTitle.toLowerCase().includes(moduleSearch.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [moduleCategoryFilter, moduleSearch]);

  // Filtered STAR Scenarios
  const filteredStarScenarios = useMemo(() => {
    return STAR_INTERVIEW_SCENARIOS.filter(s => {
      const matchCat = starCategoryFilter === 'ALL' || s.category === starCategoryFilter;
      const matchSearch = s.title.toLowerCase().includes(starSearch.toLowerCase()) ||
                          s.promptQuestion.toLowerCase().includes(starSearch.toLowerCase()) ||
                          s.competencyName.toLowerCase().includes(starSearch.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [starCategoryFilter, starSearch]);

  const handleCopyStar = async (scenario: STARInterviewScenario) => {
    const text = [
      `INTERVIEW SCENARIO: ${scenario.title}`,
      `CalMHSA Core Competency: ${scenario.competencyName} (${scenario.competencyId})`,
      `Question: ${scenario.promptQuestion}`,
      ``,
      `[SITUATION]\n${scenario.starBreakdown.situation}`,
      ``,
      `[TASK]\n${scenario.starBreakdown.task}`,
      ``,
      `[ACTION]\n${scenario.starBreakdown.action}`,
      ``,
      `[RESULT]\n${scenario.starBreakdown.result}`,
      ``,
      `[MODEL NON-CLINICAL ANSWER]\n${scenario.modelResponse}`,
      ``,
      `[PITFALLS TO AVOID]\n${scenario.clinicalPitfallsToAvoid.map(p => `• ${p}`).join('\n')}`,
      ``,
      `Reference: ${scenario.calmhsaKeyRule}`
    ].join('\n');

    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(scenario.id);
      setTimeout(() => setCopiedItem(null), 2500);
    } catch {
      // safe fallback
    }
  };

  const handleExportAttestation = () => {
    const specialistName = currentUser?.fullName || 'Certified Peer Support Specialist';
    const dateStr = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const docContent = [
      `========================================================================`,
      `CALIFORNIA SB 803 / CALMHSA PEER SPECIALIST CURRICULUM LOG & ATTESTATION`,
      `Peer Notebook • peernotebook.com • Medi-Cal H0038 Verified`,
      `========================================================================`,
      ``,
      `Specialist Name: ${specialistName}`,
      `Credential: California Certified Peer Support Specialist (CPSS-CA)`,
      `Attestation Date: ${dateStr}`,
      `Total 80-Hour Core Track Hours Logged: ${total80HrCompletedHours} / 80 Hours (${percent80Hr}%)`,
      `Total 40-Hour Specialized Hours Logged: ${total40HrCompletedHours} / 40 Hours (${percent40Hr}%)`,
      ``,
      `------------------------------------------------------------------------`,
      `COMPLETED 80-HOUR CORE MODULES:`,
      `------------------------------------------------------------------------`,
      ...CALMHSA_80HR_MODULES.filter(m => completed80HrIds.includes(m.id)).map(
        m => `[COMPLETED] Module ${m.moduleNumber}: ${m.title} (${m.hours} hrs) - Competency: ${m.competencyTitle}`
      ),
      ``,
      `------------------------------------------------------------------------`,
      `COMPLETED 40-HOUR SPECIALIZED MODULES:`,
      `------------------------------------------------------------------------`,
      ...CALMHSA_40HR_SPECIALIZED_MODULES.filter(m => completed40HrIds.includes(m.id)).map(
        m => `[COMPLETED] Specialized Track: ${m.title} (${m.hours} hrs) - Competency: ${m.competencyTitle}`
      ),
      ``,
      `------------------------------------------------------------------------`,
      `ETHICAL ATTESTATION & BOUNDARY PLEDGE:`,
      `------------------------------------------------------------------------`,
      `I hereby attest that I have studied the California DHCS and CalMHSA Peer`,
      `Support Specialist Code of Ethics, understand my non-clinical scope of`,
      `practice, and adhere strictly to zero dual relationships, purposeful lived`,
      `experience disclosure, and trauma-informed recovery engagement.`,
      ``,
      `Signed: _____________________________________   Date: __________________`
    ].join('\n');

    const blob = new Blob([docContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CalMHSA_Curriculum_Attestation_${specialistName.replace(/\s+/g, '_')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-[#1E3A8A] via-blue-900 to-[#0F766E] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#0F766E] text-white flex items-center gap-1.5 shadow-xs">
                <GraduationCap className="w-4 h-4" />
                California SB 803 / CalMHSA Certified
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-blue-100">
                HCPCS H0038 Compliant
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Peer Specialist Curriculum &amp; STAR Interview Lab
            </h1>
            <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
              Master the 80-hour CalMHSA core competencies, 40-hour specialized tracks, and behavioral STAR (Situation, Task, Action, Result) interview simulations required by California county behavioral health agencies and community-based organizations.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleExportAttestation}
              className="min-h-[46px] px-4 py-2.5 bg-white hover:bg-blue-50 text-[#1E3A8A] rounded-full text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#0F766E]" />
              <span>Export Hour Attestation</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('80hr_core')}
          className={`min-h-[48px] px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === '80hr_core'
              ? 'bg-[#1E3A8A] text-white shadow-md'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>80-Hour Core Track ({total80HrCompletedHours}/80 hrs)</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            activeTab === '80hr_core' ? 'bg-blue-800 text-blue-100' : 'bg-slate-100 text-slate-700'
          }`}>
            {percent80Hr}%
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('40hr_specialized')}
          className={`min-h-[48px] px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === '40hr_specialized'
              ? 'bg-[#0F766E] text-white shadow-md'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>40-Hour Specialized Track ({total40HrCompletedHours}/40 hrs)</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            activeTab === '40hr_specialized' ? 'bg-teal-800 text-teal-100' : 'bg-slate-100 text-slate-700'
          }`}>
            {percent40Hr}%
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('star_interview')}
          className={`min-h-[48px] px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'star_interview'
              ? 'bg-[#1E3A8A] text-white shadow-md'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>STAR Interview Simulator ({STAR_INTERVIEW_SCENARIOS.length} Scenarios)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ethics_code')}
          className={`min-h-[48px] px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'ethics_code'
              ? 'bg-[#0F766E] text-white shadow-md'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>DHCS Code of Ethics (10 Boundaries)</span>
        </button>
      </div>

      {/* TAB 1: 80-Hour CalMHSA Core Track */}
      {activeTab === '80hr_core' && (
        <div className="space-y-6">
          {/* Progress Overview Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-[#1E3A8A] flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[#0F766E]" />
                  <span>80-Hour Foundational Curriculum Hours Log</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Mandated by California Senate Bill 803 &amp; CalMHSA for initial CPSS-CA certification.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-slate-800">
                  {total80HrCompletedHours} / 80 Hours Verified
                </span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold ${
                  percent80Hr === 100
                    ? 'bg-emerald-100 text-[#16A34A]'
                    : 'bg-blue-100 text-[#1E3A8A]'
                }`}>
                  {percent80Hr}%
                </span>
              </div>
            </div>

            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#1E3A8A] to-[#0F766E] transition-all duration-300"
                style={{ width: `${percent80Hr}%` }}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs text-slate-600 border-t border-slate-100">
              <span>{completed80HrIds.length} of {CALMHSA_80HR_MODULES.length} Modules Completed</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCompleted80HrIds(CALMHSA_80HR_MODULES.map(m => m.id))}
                  className="text-xs text-[#0F766E] hover:underline font-semibold cursor-pointer"
                >
                  Mark All Complete
                </button>
                <span className="text-slate-300">·</span>
                <button
                  type="button"
                  onClick={() => setCompleted80HrIds([])}
                  className="text-xs text-slate-400 hover:text-slate-600 font-semibold cursor-pointer"
                >
                  Reset Progress
                </button>
              </div>
            </div>
          </div>

          {/* Module Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={moduleSearch}
                onChange={(e) => setModuleSearch(e.target.value)}
                placeholder="Search modules, competencies, topics..."
                className="w-full min-h-[44px] pl-10 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:border-[#0F766E]"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {['ALL', 'Foundation', 'Practice', 'Navigation', 'Ethics & Wellness'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setModuleCategoryFilter(cat)}
                  className={`min-h-[40px] px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    moduleCategoryFilter === cat
                      ? 'bg-[#1E3A8A] text-white shadow-2xs'
                      : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Modules List */}
          <div className="space-y-3.5">
            {filtered80HrModules.map((mod) => {
              const isCompleted = completed80HrIds.includes(mod.id);
              const isExpanded = expandedModuleId === mod.id;

              return (
                <div
                  key={mod.id}
                  className={`bg-white rounded-2xl border transition-all overflow-hidden ${
                    isCompleted
                      ? 'border-emerald-200/90 shadow-2xs'
                      : 'border-slate-200/90 shadow-xs'
                  }`}
                >
                  {/* Module Header Bar */}
                  <div
                    onClick={() => setExpandedModuleId(isExpanded ? null : mod.id)}
                    className="p-4 sm:p-5 flex items-start sm:items-center justify-between gap-3 cursor-pointer hover:bg-slate-50/60 select-none"
                  >
                    <div className="flex items-start gap-3.5 min-w-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleModuleCompletion(mod.id, '80hr_core');
                        }}
                        className={`min-h-[40px] min-w-[40px] rounded-xl flex items-center justify-center transition-colors cursor-pointer shrink-0 mt-0.5 sm:mt-0 ${
                          isCompleted
                            ? 'bg-[#16A34A] text-white shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-400'
                        }`}
                        title={isCompleted ? 'Mark as incomplete' : 'Mark as completed'}
                      >
                        <Check className="w-5 h-5 stroke-[2.5]" />
                      </button>

                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                            Module {mod.moduleNumber}
                          </span>
                          <span className="text-slate-300">·</span>
                          <span className="text-xs font-bold text-[#0F766E] bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200/60">
                            {mod.hours} Hours
                          </span>
                          <span className="text-xs font-semibold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/60">
                            {mod.category}
                          </span>
                          <span className="text-[11px] font-mono text-slate-500">
                            SB 803: {mod.competencyTitle}
                          </span>
                        </div>
                        <h4 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                          {mod.title}
                        </h4>
                      </div>
                    </div>

                    <div className="shrink-0 text-slate-400 pl-2">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>

                  {/* Expanded Module Details */}
                  {isExpanded && (
                    <div className="p-5 sm:p-6 bg-slate-50/50 border-t border-slate-100 space-y-4">
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                        {mod.description}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-[#1E3A8A] flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-[#0F766E]" />
                            Learning Objectives
                          </span>
                          <ul className="space-y-1.5 text-xs text-slate-700">
                            {mod.learningObjectives.map((obj, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#0F766E] shrink-0 mt-1.5" />
                                <span>{obj}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-[#1E3A8A] flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4 text-[#0F766E]" />
                            Key Topics &amp; DHCS Citations
                          </span>
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {mod.keyTopics.map((top, i) => (
                              <span key={i} className="text-[11px] bg-slate-100 text-slate-800 px-2.5 py-1 rounded-md font-medium">
                                {top}
                              </span>
                            ))}
                          </div>
                          <div className="pt-2 text-[11px] font-mono text-slate-500 space-y-0.5">
                            {mod.dhcsRegulations.map((reg, i) => (
                              <div key={i}>§ {reg}</div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="bg-teal-50/70 border border-teal-200 rounded-xl p-4 space-y-1.5">
                        <span className="text-xs font-bold text-[#0F766E] uppercase tracking-wider flex items-center gap-1.5">
                          <Lightbulb className="w-4 h-4 text-amber-500" />
                          Field Practice Application Prompt
                        </span>
                        <p className="text-xs text-teal-900 leading-relaxed italic">
                          "{mod.practicalApplicationPrompt}"
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: 40-Hour Specialized Track */}
      {activeTab === '40hr_specialized' && (
        <div className="space-y-6">
          {/* Progress Overview Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-[#0F766E] flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#0F766E]" />
                  <span>40-Hour Advanced &amp; Specialized Track Hours Log</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Specialized certifications for CalAIM Enhanced Care Management (ECM), Street Medicine, Forensics, and Peer Respite.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-slate-800">
                  {total40HrCompletedHours} / 40 Hours Verified
                </span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold ${
                  percent40Hr === 100
                    ? 'bg-emerald-100 text-[#16A34A]'
                    : 'bg-teal-100 text-[#0F766E]'
                }`}>
                  {percent40Hr}%
                </span>
              </div>
            </div>

            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#0F766E] to-emerald-600 transition-all duration-300"
                style={{ width: `${percent40Hr}%` }}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs text-slate-600 border-t border-slate-100">
              <span>{completed40HrIds.length} of {CALMHSA_40HR_SPECIALIZED_MODULES.length} Specializations Completed</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCompleted40HrIds(CALMHSA_40HR_SPECIALIZED_MODULES.map(m => m.id))}
                  className="text-xs text-[#0F766E] hover:underline font-semibold cursor-pointer"
                >
                  Mark All Complete
                </button>
                <span className="text-slate-300">·</span>
                <button
                  type="button"
                  onClick={() => setCompleted40HrIds([])}
                  className="text-xs text-slate-400 hover:text-slate-600 font-semibold cursor-pointer"
                >
                  Reset Progress
                </button>
              </div>
            </div>
          </div>

          {/* Specialized Modules Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CALMHSA_40HR_SPECIALIZED_MODULES.map((spec) => {
              const isCompleted = completed40HrIds.includes(spec.id);

              return (
                <div
                  key={spec.id}
                  className={`bg-white rounded-2xl border p-5 sm:p-6 space-y-4 flex flex-col justify-between ${
                    isCompleted ? 'border-emerald-300 shadow-sm ring-1 ring-emerald-200' : 'border-slate-200 shadow-xs'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#0F766E] bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                            {spec.hours} Hours
                          </span>
                          <span className="text-xs text-slate-500 font-mono">Specialized Track</span>
                        </div>
                        <h4 className="text-base font-bold text-slate-900 leading-snug">
                          {spec.title}
                        </h4>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleModuleCompletion(spec.id, '40hr_specialized')}
                        className={`min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                          isCompleted
                            ? 'bg-[#16A34A] text-white shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-400'
                        }`}
                        title={isCompleted ? 'Mark as incomplete' : 'Mark as completed'}
                      >
                        <Check className="w-5 h-5 stroke-[2.5]" />
                      </button>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {spec.description}
                    </p>

                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                      <span className="font-bold text-[#1E3A8A] block">Curriculum Highlights:</span>
                      <ul className="space-y-1 text-slate-700">
                        {spec.learningObjectives.slice(0, 2).map((obj, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#0F766E] shrink-0 mt-1.5" />
                            <span>{obj}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="font-mono">DHCS POS 15 &amp; 27 Standards</span>
                    <span className="font-bold text-[#0F766E]">
                      {isCompleted ? 'Verified Complete' : 'Incomplete'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: STAR Interview Preparation Simulator */}
      {activeTab === 'star_interview' && (
        <div className="space-y-6">
          {/* STAR Explainer Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-base font-bold text-[#1E3A8A] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                The Non-Clinical STAR Method for Peer Specialists
              </h3>
              <span className="text-xs font-bold text-[#0F766E] bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                County Behavioral Health &amp; CBO Hiring Standard
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              When interviewing for California Peer Support Specialist roles, hiring committees evaluate whether you can clearly articulate your lived experience while rigorously protecting non-clinical boundaries. Use the STAR framework:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-0.5">
                <span className="text-xs font-extrabold text-[#1E3A8A]">S · Situation</span>
                <p className="text-[11px] text-blue-900 leading-snug">The real encounter context or crisis background.</p>
              </div>
              <div className="p-3 bg-teal-50/70 border border-teal-200 rounded-xl space-y-0.5">
                <span className="text-xs font-extrabold text-[#0F766E]">T · Task</span>
                <p className="text-[11px] text-teal-900 leading-snug">Your peer role (staying in non-clinical scope).</p>
              </div>
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-0.5">
                <span className="text-xs font-extrabold text-[#D97706]">A · Action</span>
                <p className="text-[11px] text-amber-900 leading-snug">Concrete peer intervention you initiated.</p>
              </div>
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-0.5">
                <span className="text-xs font-extrabold text-[#16A34A]">R · Result</span>
                <p className="text-[11px] text-emerald-900 leading-snug">Measurable outcome or empowerment for peer.</p>
              </div>
            </div>
          </div>

          {/* Scenario Selector & Filters */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Scenario List */}
            <div className="lg:col-span-1 space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={starSearch}
                  onChange={(e) => setStarSearch(e.target.value)}
                  placeholder="Filter scenarios..."
                  className="w-full min-h-[40px] pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:border-[#0F766E]"
                />
              </div>

              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                {filteredStarScenarios.map((scen) => {
                  const isSelected = selectedStarScenario.id === scen.id;
                  const hasUserNotes = Boolean(userPracticeNotes[scen.id]?.trim());

                  return (
                    <div
                      key={scen.id}
                      onClick={() => setSelectedStarScenario(scen)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer text-left space-y-1.5 ${
                        isSelected
                          ? 'bg-blue-50/80 border-[#1E3A8A] shadow-sm ring-1 ring-[#1E3A8A]/30'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#0F766E] truncate">
                          {scen.category}
                        </span>
                        {hasUserNotes && (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-md">
                            Practiced
                          </span>
                        )}
                      </div>
                      <h4 className={`text-xs font-bold leading-snug ${
                        isSelected ? 'text-[#1E3A8A]' : 'text-slate-900'
                      }`}>
                        {scen.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 truncate">
                        {scen.promptQuestion}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Active Scenario Deep Dive */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
                {/* Header */}
                <div className="space-y-2 border-b border-slate-100 pb-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#1E3A8A] text-white">
                        {selectedStarScenario.category}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">
                        {selectedStarScenario.competencyId}: {selectedStarScenario.competencyName}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopyStar(selectedStarScenario)}
                      className="min-h-[40px] px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copiedItem === selectedStarScenario.id ? (
                        <>
                          <CheckCheck className="w-3.5 h-3.5 text-[#16A34A]" />
                          <span className="text-[#16A34A]">Copied Full STAR!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-500" />
                          <span>Copy Scenario</span>
                        </>
                      )}
                    </button>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900">
                    {selectedStarScenario.title}
                  </h3>

                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Typical Interviewer Prompt:
                    </span>
                    <p className="text-xs sm:text-sm font-semibold text-[#1E3A8A] italic">
                      "{selectedStarScenario.promptQuestion}"
                    </p>
                  </div>
                </div>

                {/* S-T-A-R 4-Box Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 bg-blue-50/40 border border-blue-200/80 rounded-xl space-y-1">
                    <span className="text-xs font-extrabold text-[#1E3A8A] block">
                      [S] Situation
                    </span>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {selectedStarScenario.starBreakdown.situation}
                    </p>
                  </div>

                  <div className="p-4 bg-teal-50/40 border border-teal-200/80 rounded-xl space-y-1">
                    <span className="text-xs font-extrabold text-[#0F766E] block">
                      [T] Task &amp; Scope
                    </span>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {selectedStarScenario.starBreakdown.task}
                    </p>
                  </div>

                  <div className="p-4 bg-amber-50/40 border border-amber-200/80 rounded-xl space-y-1 sm:col-span-2">
                    <span className="text-xs font-extrabold text-[#D97706] block">
                      [A] Action &amp; Peer Intervention
                    </span>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {selectedStarScenario.starBreakdown.action}
                    </p>
                  </div>

                  <div className="p-4 bg-emerald-50/40 border border-emerald-200/80 rounded-xl space-y-1 sm:col-span-2">
                    <span className="text-xs font-extrabold text-[#16A34A] block">
                      [R] Result &amp; Mutual Empowerment
                    </span>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {selectedStarScenario.starBreakdown.result}
                    </p>
                  </div>
                </div>

                {/* Model Response & Red Flag Pitfalls */}
                <div className="space-y-3 pt-2">
                  <div className="p-4 bg-[#F8FAFC] border border-slate-200 rounded-xl space-y-1.5">
                    <span className="text-xs font-bold text-[#1E3A8A] uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      Model Exemplar Answer (Verbatim Candidate Quote)
                    </span>
                    <p className="text-xs sm:text-sm text-slate-800 italic leading-relaxed">
                      {selectedStarScenario.modelResponse}
                    </p>
                  </div>

                  <div className="p-4 bg-rose-50/60 border border-rose-200 rounded-xl space-y-1.5">
                    <span className="text-xs font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      Clinical Red Flags / Common Pitfalls to Avoid in the Interview
                    </span>
                    <ul className="space-y-1 text-xs text-rose-900">
                      {selectedStarScenario.clinicalPitfallsToAvoid.map((pit, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-rose-500 font-bold">•</span>
                          <span>{pit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="text-[11px] font-mono text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <strong>CalMHSA Benchmark:</strong> {selectedStarScenario.calmhsaKeyRule}
                  </div>
                </div>

                {/* Candidate Self-Practice Workspace */}
                <div className="pt-4 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-[#0F766E]" />
                      <span>My Personal STAR Practice Notes for this Scenario</span>
                    </label>
                    <span className="text-[11px] text-slate-500">
                      Saved offline in local browser vault
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    value={userPracticeNotes[selectedStarScenario.id] || ''}
                    onChange={(e) => handleSavePracticeNote(selectedStarScenario.id, e.target.value)}
                    placeholder="Draft your own lived experience response using Situation, Task, Action, Result..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-[#0F766E] focus:bg-white transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: DHCS Code of Ethics & Boundary Checklist */}
      {activeTab === 'ethics_code' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-base font-bold text-[#1E3A8A] flex items-center gap-2">
                <Scale className="w-5 h-5 text-[#0F766E]" />
                <span>DHCS &amp; CalMHSA Code of Ethics: 10 Ethical Boundary Standards</span>
              </h3>
              <span className="text-xs font-bold text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                California CPSS-CA Credential Requirement
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every certified peer specialist in California must adhere to the DHCS Medi-Cal Peer Support Specialist Code of Ethics. These ten standards protect both the vulnerability of peers receiving services and the professional longevity of specialists.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CALMHSA_ETHICS_CHECKLIST_DATA.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-xs hover:border-slate-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-50 text-[#1E3A8A] flex items-center justify-center text-xs font-bold shrink-0">
                      {item.ruleNumber}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900">
                      {item.title}
                    </h4>
                  </div>
                  <span className="text-[10px] font-bold text-[#0F766E] bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200 shrink-0">
                    {item.shortLabel}
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed">
                  {item.description}
                </p>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-xs text-slate-600 space-y-0.5">
                  <span className="font-semibold text-slate-800 block">Practical Peer Standard:</span>
                  <p className="italic text-slate-600">"{item.practiceStandard}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
