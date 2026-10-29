/**
 * Peer Notebook - GoalPath Non-Clinical Wellness Tracking & SB 803 Competency Alignment
 * Standard: GA #8 Medi-Cal / CalAIM Strengths-Based Recovery Architecture
 * Features:
 *  - 5 CalAIM Wellness Domains: Housing, Social Connection, Self-Advocacy, Employment/Education, Daily Routines
 *  - 17 California SB 803 / CalMHSA Core Competencies Tracking & Encounter Coverage Matrix
 *  - Plain-English Prompts & 1-Tap Interventions
 */

import React, { useState } from 'react';
import {
  Home,
  Users,
  Compass,
  Briefcase,
  Sun,
  CheckCircle2,
  TrendingUp,
  Filter,
  Sparkles,
  ChevronRight,
  Target,
  Award,
  BookOpen,
  Shield,
  Layers,
  HeartHandshake
} from 'lucide-react';
import { SessionNote } from '../db/peerNotebookDatabase';
import { SB_803_CORE_COMPETENCIES, SB803Competency } from '../data/sb803Competencies';
import { SB803CompetencyGuide } from './SB803CompetencyGuide';

export interface WellnessDomainMetric {
  id: string;
  name: string;
  icon: React.ReactNode;
  colorClass: string;
  bgLightClass: string;
  borderColorClass: string;
  description: string;
  coreSkills: string[];
  sampleIntervention: string;
}

export const WELLNESS_DOMAINS: WellnessDomainMetric[] = [
  {
    id: 'housing',
    name: 'Housing',
    icon: <Home className="w-5 h-5 text-blue-700" />,
    colorClass: 'text-blue-700',
    bgLightClass: 'bg-blue-50',
    borderColorClass: 'border-blue-200',
    description: 'Permanent supportive housing navigation, tenancy rights, lease readiness, and home stabilization.',
    coreSkills: ['Housing Transition Navigation', 'Landlord Communication Roleplay', 'Utility & Eviction Prevention'],
    sampleIntervention: 'CPSS collaborated on Housing Transition application paperwork, practiced roleplay with landlord, and mapped housing inspection checklist.',
  },
  {
    id: 'social_connection',
    name: 'Social Connection',
    icon: <Users className="w-5 h-5 text-teal-700" />,
    colorClass: 'text-teal-700',
    bgLightClass: 'bg-teal-50',
    borderColorClass: 'border-teal-200',
    description: 'Mutual aid recovery communities, healthy interpersonal boundaries, and reducing isolation.',
    coreSkills: ['Mutual Aid Group Linkage', 'Healthy Boundary Setting', 'Natural Support System Mapping'],
    sampleIntervention: 'CPSS shared lived experience regarding navigating early recovery isolation, attended mutual aid community drop-in meeting together.',
  },
  {
    id: 'self_advocacy',
    name: 'Self-Advocacy',
    icon: <Compass className="w-5 h-5 text-indigo-700" />,
    colorClass: 'text-indigo-700',
    bgLightClass: 'bg-indigo-50',
    borderColorClass: 'border-indigo-200',
    description: 'Expressing personal recovery preferences, navigating county healthcare systems, and asserting rights.',
    coreSkills: ['Medical Appointment Prep', 'Client Rights Education', 'Personal Bill of Rights Coaching'],
    sampleIntervention: 'CPSS coached peer on asking clarifying questions during psychiatrist consultation and roleplayed expressing medication side effect concerns.',
  },
  {
    id: 'employment_education',
    name: 'Employment / Education',
    icon: <Briefcase className="w-5 h-5 text-amber-700" />,
    colorClass: 'text-amber-700',
    bgLightClass: 'bg-amber-50',
    borderColorClass: 'border-amber-200',
    description: 'Vocational recovery, resume building, volunteer service, and adult education pathway navigation.',
    coreSkills: ['Strengths-Based Resume Draft', 'Interview Anxiety Coping', 'Vocational Rehab (DOR) Linkage'],
    sampleIntervention: 'CPSS identified transferable life strengths for vocational resume, practiced managing workplace stress triggers.',
  },
  {
    id: 'daily_routines',
    name: 'Daily Routines',
    icon: <Sun className="w-5 h-5 text-emerald-700" />,
    colorClass: 'text-emerald-700',
    bgLightClass: 'bg-emerald-50',
    borderColorClass: 'border-emerald-200',
    description: 'Somatic grounding, sleep hygiene, structured daytime routines, and wellness self-management.',
    coreSkills: ['Somatic Box Breathing', 'Morning Recovery Routine', 'Sensory 5-4-3-2-1 Grounding'],
    sampleIntervention: 'Facilitated 5-4-3-2-1 grounding exercise to down-regulate acute nervous system distress; co-designed simple morning wellness rhythm.',
  },
];

interface GoalPathTrackerProps {
  notes?: SessionNote[];
  onSelectDomainFilter?: (domainName: string | null) => void;
  selectedDomainFilter?: string | null;
  onApplyPromptSnippet?: (snippet: string) => void;
}

export const GoalPathTracker: React.FC<GoalPathTrackerProps> = ({
  notes = [],
  onSelectDomainFilter,
  selectedDomainFilter,
  onApplyPromptSnippet,
}) => {
  const [viewMode, setViewMode] = useState<'domains' | 'competencies'>('domains');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('ALL');
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [selectedCompetency, setSelectedCompetency] = useState<SB803Competency | null>(null);

  // Compute domain touch frequencies from notes
  const domainFrequencies: Record<string, number> = {
    housing: 0,
    social_connection: 0,
    self_advocacy: 0,
    employment_education: 0,
    daily_routines: 0,
  };

  notes.forEach((note) => {
    const text = (
      (note.goalAddressed || '') +
      ' ' +
      (note.peerIntervention || '') +
      ' ' +
      (note.focusDomains || []).join(' ')
    ).toLowerCase();

    if (text.includes('housing') || text.includes('shelter') || text.includes('rent') || text.includes('tenancy')) {
      domainFrequencies.housing++;
    }
    if (text.includes('social') || text.includes('connection') || text.includes('isolation') || text.includes('mutual aid') || text.includes('community')) {
      domainFrequencies.social_connection++;
    }
    if (text.includes('advocacy') || text.includes('rights') || text.includes('appointment') || text.includes('doctor')) {
      domainFrequencies.self_advocacy++;
    }
    if (text.includes('employment') || text.includes('job') || text.includes('education') || text.includes('vocational') || text.includes('resume')) {
      domainFrequencies.employment_education++;
    }
    if (text.includes('routine') || text.includes('sleep') || text.includes('grounding') || text.includes('somatic') || text.includes('daily')) {
      domainFrequencies.daily_routines++;
    }
  });

  // Compute SB 803 Competency touch frequencies
  const competencyFrequencies: Record<string, number> = {};
  SB_803_CORE_COMPETENCIES.forEach((comp) => {
    competencyFrequencies[comp.id] = 0;
  });

  notes.forEach((note) => {
    // Check tagged competencies array
    if (note.sb803Competencies && Array.isArray(note.sb803Competencies)) {
      note.sb803Competencies.forEach((id) => {
        if (competencyFrequencies[id] !== undefined) {
          competencyFrequencies[id]++;
        }
      });
    }

    // Also check narrative keywords for cross-walk alignment
    const fullText = (
      (note.goalAddressed || '') +
      ' ' +
      (note.peerIntervention || '') +
      ' ' +
      (note.clientResponse || '')
    ).toLowerCase();

    if (fullText.includes('harm reduction') || fullText.includes('naloxone') || fullText.includes('overdose')) {
      competencyFrequencies['SB803-15'] = Math.max(competencyFrequencies['SB803-15'] || 0, 1);
    }
    if (fullText.includes('wrap') || fullText.includes('wellness recovery action plan')) {
      competencyFrequencies['SB803-08'] = Math.max(competencyFrequencies['SB803-08'] || 0, 1);
    }
    if (fullText.includes('trauma-informed') || fullText.includes('grounding') || fullText.includes('safe space')) {
      competencyFrequencies['SB803-03'] = Math.max(competencyFrequencies['SB803-03'] || 0, 1);
    }
    if (fullText.includes('self-advocacy') || fullText.includes('rights') || fullText.includes('assertive')) {
      competencyFrequencies['SB803-12'] = Math.max(competencyFrequencies['SB803-12'] || 0, 1);
    }
    if (fullText.includes('de-escalation') || fullText.includes('crisis') || fullText.includes('conflict')) {
      competencyFrequencies['SB803-16'] = Math.max(competencyFrequencies['SB803-16'] || 0, 1);
    }
  });

  const totalEncounters = Math.max(1, notes.length);
  const loggedCompetenciesCount = SB_803_CORE_COMPETENCIES.filter(
    (c) => (competencyFrequencies[c.id] || 0) > 0
  ).length;
  const coveragePercentage = Math.round((loggedCompetenciesCount / 17) * 100);

  const filteredCompetencies = SB_803_CORE_COMPETENCIES.filter((comp) => {
    if (activeCategoryFilter === 'ALL') return true;
    return comp.category === activeCategoryFilter;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-6">
      {/* Header with Dual View Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-teal-50 text-[#0F766E] rounded-xl border border-teal-200 shrink-0">
            {viewMode === 'domains' ? (
              <Target className="w-5 h-5 text-[#0F766E]" />
            ) : (
              <Award className="w-5 h-5 text-[#1E3A8A]" />
            )}
          </div>
          <div>
            <h3 className="text-base font-bold text-[#1E3A8A] flex items-center gap-2">
              <span>GoalPath Recovery &amp; Competency Tracker</span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#1E3A8A] border border-blue-200">
                CalAIM H0038
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              California SB 803 Core Competencies · Strengths-Based Wellness Domains
            </p>
          </div>
        </div>

        {/* View Mode Switcher Pills */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 bg-slate-100 rounded-full border border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => setViewMode('domains')}
              className={`min-h-[38px] px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                viewMode === 'domains'
                  ? 'bg-white text-[#1E3A8A] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              5 Wellness Domains
            </button>
            <button
              type="button"
              onClick={() => setViewMode('competencies')}
              className={`min-h-[38px] px-3.5 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'competencies'
                  ? 'bg-[#1E3A8A] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-amber-300" />
              <span>17 SB 803 Competencies ({loggedCompetenciesCount}/17)</span>
            </button>
          </div>

          {selectedDomainFilter && (
            <button
              onClick={() => onSelectDomainFilter?.(null)}
              className="min-h-[38px] px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Clear Filter</span>
            </button>
          )}
        </div>
      </div>

      {/* VIEW MODE 1: 5 CALAIM WELLNESS DOMAINS */}
      {viewMode === 'domains' && (
        <div className="space-y-5 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            {WELLNESS_DOMAINS.map((domain) => {
              const count = domainFrequencies[domain.id] || 0;
              const percentage = Math.round((count / totalEncounters) * 100);
              const isSelected = selectedDomainFilter === domain.name;

              return (
                <div
                  key={domain.id}
                  onClick={() => onSelectDomainFilter?.(isSelected ? null : domain.name)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                    isSelected
                      ? 'bg-blue-50/80 border-[#1E3A8A] shadow-xs ring-1 ring-[#1E3A8A]'
                      : 'bg-slate-50/80 border-slate-200/90 hover:bg-white hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className={`p-2 rounded-lg ${domain.bgLightClass} ${domain.borderColorClass} border shrink-0`}>
                        {domain.icon}
                      </div>
                      <span className="font-mono text-xs font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {count} Note{count === 1 ? '' : 's'}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{domain.name}</h4>
                      <p className="text-[11px] text-slate-500 leading-snug line-clamp-2 mt-0.5">
                        {domain.description}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1 pt-1 border-t border-slate-200/70">
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>Encounter Share</span>
                      <span className="font-bold text-slate-700">{percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-1.5 rounded-full ${
                          domain.id === 'housing'
                            ? 'bg-blue-600'
                            : domain.id === 'social_connection'
                            ? 'bg-teal-600'
                            : domain.id === 'self_advocacy'
                            ? 'bg-indigo-600'
                            : domain.id === 'employment_education'
                            ? 'bg-amber-600'
                            : 'bg-emerald-600'
                        }`}
                        style={{ width: `${Math.max(5, percentage)}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Domain Quick Intervention Prompts Bar */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#0F766E] shrink-0" />
              <span className="text-slate-700 font-medium">
                Tap a domain above to filter notes, or insert certified non-clinical intervention language into your note draft.
              </span>
            </div>

            {onApplyPromptSnippet && (
              <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                {WELLNESS_DOMAINS.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => onApplyPromptSnippet(d.sampleIntervention)}
                    className="min-h-[44px] px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-full text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shadow-2xs"
                    title={`Insert sample intervention for ${d.name}`}
                  >
                    + {d.name} Snippet
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW MODE 2: 17 CALIFORNIA SB 803 CORE COMPETENCIES MATRIX */}
      {viewMode === 'competencies' && (
        <div className="space-y-5 animate-in fade-in duration-150">
          {/* Top Banner KPI */}
          <div className="p-4 bg-gradient-to-r from-blue-900 to-[#1E3A8A] text-white rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0F766E] text-white uppercase tracking-wider">
                  California Senate Bill 803
                </span>
                <span className="text-xs text-blue-200 font-mono">CalMHSA CPSS-CA Standards</span>
              </div>
              <h4 className="text-lg font-bold">17 Core Peer Support Competencies Matrix</h4>
              <p className="text-xs text-blue-100/90 max-w-xl">
                Demonstrated competencies reinforce Medi-Cal H0038 medical necessity and ensure full compliance with California DHCS Peer Support certification guidelines.
              </p>
            </div>

            <div className="flex items-center gap-4 shrink-0 bg-white/10 p-3 rounded-xl border border-white/20">
              <div className="text-center">
                <div className="text-2xl font-black font-mono">{loggedCompetenciesCount} / 17</div>
                <div className="text-[10px] text-blue-200 uppercase font-semibold">Active in Notes</div>
              </div>
              <div className="h-8 w-px bg-white/20" />
              <button
                type="button"
                onClick={() => setIsGuideOpen(true)}
                className="min-h-[44px] px-3.5 py-2 bg-white hover:bg-blue-50 text-[#1E3A8A] rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-[#0F766E]" />
                <span>Open Guide &amp; Prompts</span>
              </button>
            </div>
          </div>

          {/* Filter Pills across the 4 Competency Categories */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {['ALL', 'Foundation', 'Practice', 'Navigation', 'Ethics & Wellness'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategoryFilter(cat)}
                className={`min-h-[40px] px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeCategoryFilter === cat
                    ? 'bg-[#1E3A8A] text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Competencies 17-Card Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredCompetencies.map((comp) => {
              const count = competencyFrequencies[comp.id] || 0;
              const isLogged = count > 0;
              const isSelected = selectedCompetency?.id === comp.id;

              return (
                <div
                  key={comp.id}
                  onClick={() => setSelectedCompetency(isSelected ? null : comp)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-2.5 ${
                    isSelected
                      ? 'bg-blue-50/90 border-[#1E3A8A] ring-1 ring-[#1E3A8A] shadow-xs'
                      : isLogged
                      ? 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-xs'
                      : 'bg-slate-50/70 border-slate-200/80 hover:bg-white text-slate-600'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 shrink-0">
                          {comp.id}
                        </span>
                        <span className="text-[10px] text-slate-500 font-semibold truncate">
                          {comp.category}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-mono shrink-0 ${
                          isLogged
                            ? 'bg-emerald-100 text-[#16A34A] border border-emerald-300'
                            : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        {count} Note{count === 1 ? '' : 's'}
                      </span>
                    </div>

                    <h5 className="text-xs font-bold text-slate-900 leading-snug">
                      {comp.number}. {comp.title}
                    </h5>

                    <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-2">
                      {comp.plainEnglishDescription}
                    </p>
                  </div>

                  {/* Documentation Prompt Preview */}
                  <div className="p-2 bg-slate-100/80 rounded-lg text-[10px] text-slate-700 space-y-1">
                    <span className="font-bold text-[#0F766E] block">Documentation Prompt:</span>
                    <p className="italic line-clamp-2">"{comp.documentationPrompt}"</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Competency Detail Drawer / Banner */}
          {selectedCompetency && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl space-y-3 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#1E3A8A] text-white">
                    {selectedCompetency.id}
                  </span>
                  <h4 className="text-sm font-bold text-[#1E3A8A]">
                    {selectedCompetency.number}. {selectedCompetency.title}
                  </h4>
                </div>
                <span className="text-xs text-[#0F766E] font-semibold bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200 self-start sm:self-auto">
                  {selectedCompetency.category}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-700">
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                  <span className="font-bold text-[#1E3A8A] block">Plain-English Scope:</span>
                  <p>{selectedCompetency.plainEnglishDescription}</p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                  <span className="font-bold text-[#0F766E] block">CalAIM H0038 Relevance:</span>
                  <p>{selectedCompetency.calaimRelevance}</p>
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-slate-800 block">Sample Note Documentation Prompt:</span>
                  <p className="italic text-slate-600">"{selectedCompetency.documentationPrompt}"</p>
                </div>
                {onApplyPromptSnippet && (
                  <button
                    type="button"
                    onClick={() => onApplyPromptSnippet(`[${selectedCompetency.title}] ${selectedCompetency.documentationPrompt}`)}
                    className="min-h-[44px] px-4 py-2 bg-[#0F766E] hover:bg-teal-700 text-white rounded-full font-bold transition-all shrink-0 cursor-pointer shadow-xs"
                  >
                    + Insert in New Note
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SB 803 Competency Guide Modal */}
      <SB803CompetencyGuide
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </div>
  );
};
