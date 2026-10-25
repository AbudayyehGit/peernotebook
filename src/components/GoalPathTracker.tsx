/**
 * Peer Notebook - GoalPath Non-Clinical Wellness Tracking
 * GA #8 Medi-Cal / CalAIM Strengths-Based Recovery Architecture
 * Monitored Domains: Housing, Social Connection, Self-Advocacy, Employment/Education, Daily Routines
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
  Target
} from 'lucide-react';
import { SessionNote } from '../db/peerNotebookDatabase';

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
  const [activeTab, setActiveTab] = useState<string>('all');

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

  const totalEncounters = Math.max(1, notes.length);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-teal-50 text-[#0F766E] rounded-xl border border-teal-200 shrink-0">
            <Target className="w-5 h-5 text-[#0F766E]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#1E3A8A]">
              GoalPath Non-Clinical Wellness Tracker
            </h3>
            <p className="text-xs text-slate-500">
              Medi-Cal CalAIM Non-Clinical Core Competencies · Strengths-Based Domains
            </p>
          </div>
        </div>

        {selectedDomainFilter && (
          <button
            onClick={() => onSelectDomainFilter?.(null)}
            className="self-start sm:self-auto min-h-[44px] px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Clear Filter ({selectedDomainFilter})</span>
          </button>
        )}
      </div>

      {/* 5 Domain Cards Grid */}
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
  );
};
