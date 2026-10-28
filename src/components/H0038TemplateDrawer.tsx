/**
 * Peer Notebook - CalAIM H0038 Standardized Encounter Note Template Drawer
 * GA #8 Standard • Medi-Cal Golden-Thread Documentation
 * Provides 8 pre-validated, non-clinical peer support encounter templates
 * for rapid clinical insertion with full DHCS / CalAIM 4-part compliance.
 */

import React, { useState, useMemo } from 'react';
import {
  FileText,
  Search,
  X,
  Check,
  Clock,
  Sparkles,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Home,
  HeartHandshake,
  ShieldAlert,
  Briefcase,
  Compass,
  Activity,
  Layers,
  ChevronRight
} from 'lucide-react';
import { ServiceModality } from '../db/peerNotebookDatabase';

export interface H0038Template {
  id: string;
  title: string;
  category: 'Housing' | 'Harm Reduction' | 'Recovery' | 'Crisis/WRAP' | 'Re-Entry' | 'ECM' | 'Vocational' | 'Regulation';
  summary: string;
  modality: ServiceModality;
  placeOfServiceCode: string;
  locationDetails: string;
  focusDomains: string[];
  faceToFaceMinutes: number;
  travelMinutes: number;
  documentationMinutes: number;
  goalAddressed: string;
  peerIntervention: string;
  clientResponse: string;
  planNextSteps: string;
  recommendedInterventionChips: string[];
}

export const H0038_STANDARDIZED_TEMPLATES: H0038Template[] = [
  {
    id: 'calaim_housing_navigation',
    title: 'Housing Navigation & Move-In Stabilization',
    category: 'Housing',
    summary: 'CalAIM Community Supports Housing Transition encounter focused on lease signing, utility setup, and neighborhood orientation.',
    modality: 'community_field',
    placeOfServiceCode: '15',
    locationDetails: 'Community / Client permanent supportive housing site',
    focusDomains: ['Housing Stability', 'CalAIM Community Supports', 'System Navigation'],
    faceToFaceMinutes: 60,
    travelMinutes: 15,
    documentationMinutes: 15,
    goalAddressed: 'Client Recovery Careplan Goal 1: Obtain and sustain independent permanent supportive housing to stabilize daily recovery routines.',
    peerIntervention: 'CPSS met with client at prospective housing site. Provided peer encouragement and shared lived experience regarding the anxiety of moving into independent housing. Accompanied client during lease review with property manager, assisting client with self-advocacy questions regarding building rules and utility setup. Guided client through initial move-in checklist.',
    clientResponse: 'Client actively reviewed lease documents, signed rental agreement with property manager, and expressed feeling 75% less overwhelmed with peer present. Client identified 2 personal boundary strategies for maintaining peace in the new apartment.',
    planNextSteps: 'CPSS and client will meet Tuesday at 10:00 AM at the housing site to verify utility turn-on and transport initial welcome-home recovery supplies.',
    recommendedInterventionChips: ['lived_exp', 'housing_nav', 'advocacy']
  },
  {
    id: 'calaim_harm_reduction',
    title: 'Harm Reduction & Naloxone Distribution',
    category: 'Harm Reduction',
    summary: 'Non-judgmental overdose prevention, fentanyl test strip training, and safe disposal education in field settings.',
    modality: 'community_field',
    placeOfServiceCode: '15',
    locationDetails: 'Mobile outreach van / Community drop-in zone',
    focusDomains: ['Harm Reduction', 'Relapse Prevention', 'System Navigation'],
    faceToFaceMinutes: 45,
    travelMinutes: 15,
    documentationMinutes: 15,
    goalAddressed: 'Client Recovery Careplan Goal 3: Implement harm reduction and overdose prevention practices to preserve physical safety while exploring recovery options.',
    peerIntervention: 'CPSS met client at community drop-in park. Provided non-judgmental active listening regarding recent substance use patterns. Demonstrated proper administration of intranasal Naloxone (Narcan) and verified client understanding. Supplied 2 Naloxone kits and 5 fentanyl test strip packets. Explored client feelings regarding safety planning without lecturing or clinical pressure.',
    clientResponse: 'Client demonstrated correct spray technique on demo trainer, agreed to carry 1 Narcan box in backpack, and verbalized knowing where the local needle exchange operates on Thursdays. Reported feeling respected and unjudged.',
    planNextSteps: 'Check in with client at community center Friday afternoon to review harm reduction supply levels and discuss weekend safety strategies.',
    recommendedInterventionChips: ['harm_reduction', 'lived_exp', 'resource_conn']
  },
  {
    id: 'calaim_substance_recovery',
    title: 'Substance Use Recovery Capital & Trigger Planning',
    category: 'Recovery',
    summary: 'Explores internal/external craving cues, updates recovery capital mapping, and links to peer mutual aid fellowships.',
    modality: 'face_to_face',
    placeOfServiceCode: '11',
    locationDetails: 'Peer Wellness Center consultation room',
    focusDomains: ['Recovery Goals', 'Relapse Prevention', 'Coping Skills'],
    faceToFaceMinutes: 45,
    travelMinutes: 0,
    documentationMinutes: 15,
    goalAddressed: 'Client Recovery Careplan Goal 2: Expand recovery capital and develop at least three non-substance coping strategies for social anxiety triggers.',
    peerIntervention: 'CPSS facilitated a 1-on-1 recovery capital mapping session. Shared lived experience of navigating social triggers during early recovery. Guided client through identifying top 3 emotional craving cues (fatigue, isolation, conflict). Explored all-recovery meeting schedules and modeled telephone outreach to a mutual aid peer.',
    clientResponse: 'Client mapped out 3 personal recovery assets (sister, dog, church group), identified fatigue as primary craving cue, and agreed to attend one 12-Step or SMART Recovery meeting this week.',
    planNextSteps: 'CPSS will accompany client to Wednesday 6:30 PM community recovery meeting and debrief for 15 minutes post-meeting.',
    recommendedInterventionChips: ['relapse_plan', 'lived_exp', 'peer_mentor']
  },
  {
    id: 'calaim_wrap_crisis',
    title: 'WRAP Alignment & Crisis De-Escalation',
    category: 'Crisis/WRAP',
    summary: 'Wellness Recovery Action Plan review, identifying early warning signs, and building an individualized crisis response blueprint.',
    modality: 'community_field',
    placeOfServiceCode: '15',
    locationDetails: 'Public park gazebo near client residence',
    focusDomains: ['Mental Health Wellness', 'Coping Skills', 'Recovery Goals'],
    faceToFaceMinutes: 60,
    travelMinutes: 15,
    documentationMinutes: 15,
    goalAddressed: 'Client Recovery Careplan Goal 4: Complete and maintain an individualized Wellness Recovery Action Plan (WRAP) to prevent hospitalization.',
    peerIntervention: 'CPSS reviewed Section 2 (Early Warning Signs) and Section 3 (When Things Are Breaking Down) of client WRAP binder. Modeled distress tolerance strategies and shared lived perspective on recognizing irritability as an indicator of sensory overload. Supported client in listing designated trusted supporters and emergency phone lines.',
    clientResponse: 'Client updated crisis contact list with 2 trusted friends, practiced box breathing, and rated subjective emotional activation from 8/10 down to 4/10 after 20 minutes of peer engagement.',
    planNextSteps: 'Client will keep laminated WRAP summary on refrigerator; CPSS will schedule check-in call on Thursday at 2:00 PM.',
    recommendedInterventionChips: ['somatic_breath', 'sensory_54321', 'relapse_plan']
  },
  {
    id: 'calaim_community_reentry',
    title: 'Community Re-Entry & Justice Diversion Linkage',
    category: 'Re-Entry',
    summary: 'Assisting peers navigating probation requirements, court dates, and community integration following incarceration.',
    modality: 'community_field',
    placeOfServiceCode: '15',
    locationDetails: 'County Probation & Community Re-entry Resource Hub',
    focusDomains: ['System Navigation', 'Recovery Goals', 'CalAIM Community Supports'],
    faceToFaceMinutes: 75,
    travelMinutes: 20,
    documentationMinutes: 15,
    goalAddressed: 'Client Recovery Careplan Goal 5: Complete probation compliance milestones and re-establish valid California state identification.',
    peerIntervention: 'CPSS met client at county re-entry hub. Addressed client apprehension regarding probation officer check-in by role-playing communication and sharing lived experience of re-entry probation navigation. Accompanied client into the lobby and assisted in organizing verification documents for court compliance.',
    clientResponse: 'Client successfully completed monthly probation check-in without conflict, obtained official attendance confirmation, and expressed relief at having peer specialist presence in the building.',
    planNextSteps: 'CPSS will assist client with DMV fee waiver voucher application on Monday at 9:30 AM to obtain California Real ID.',
    recommendedInterventionChips: ['lived_exp', 'advocacy', 'resource_conn']
  },
  {
    id: 'calaim_ecm_accompaniment',
    title: 'Enhanced Care Management (ECM) Medical Accompaniment',
    category: 'ECM',
    summary: 'CalAIM ECM coordination, attending primary care or specialty health visits to bridge medical distrust and advocate for peer needs.',
    modality: 'community_field',
    placeOfServiceCode: '15',
    locationDetails: 'County Health Center outpatient clinic',
    focusDomains: ['Enhanced Care Management (ECM)', 'System Navigation', 'Mental Health Wellness'],
    faceToFaceMinutes: 90,
    travelMinutes: 25,
    documentationMinutes: 15,
    goalAddressed: 'Client Recovery Careplan Goal 6: Engage consistently with CalAIM Enhanced Care Management (ECM) team to manage chronic health conditions.',
    peerIntervention: 'CPSS met client at transit stop and walked together to community health clinic for scheduled diabetes/primary care visit. Supported client in writing down 3 questions for physician regarding medication side effects. Sat in waiting room to provide calming grounding presence and reinforced client rights to respectful medical care.',
    clientResponse: 'Client attended scheduled appointment, asked doctor about lab results, picked up prescribed maintenance medications from pharmacy, and rated visit anxiety at 3/10 compared to past avoidance.',
    planNextSteps: 'Follow up with client via phone Friday at 11:00 AM to verify medication regimen comfort and schedule next month follow-up visit.',
    recommendedInterventionChips: ['advocacy', 'somatic_breath', 'resource_conn']
  },
  {
    id: 'calaim_vocational_readiness',
    title: 'Vocational Readiness & Lived-Experience Job Coaching',
    category: 'Vocational',
    summary: 'Resume refinement, interview preparation, and addressing past justice-involvement or gaps on applications using lived experience.',
    modality: 'community_field',
    placeOfServiceCode: '15',
    locationDetails: 'Public Library career center computer lab',
    focusDomains: ['Vocational/Employment', 'Recovery Goals', 'Coping Skills'],
    faceToFaceMinutes: 45,
    travelMinutes: 0,
    documentationMinutes: 15,
    goalAddressed: 'Client Recovery Careplan Goal 7: Secure part-time recovery-friendly employment or volunteer placement within 90 days.',
    peerIntervention: 'CPSS met with client in public library career room. Reviewed client draft resume, suggested strengths-based phrasing for transferable skills, and discussed how to discuss gaps in employment without shame. Role-played standard interview question responses.',
    clientResponse: 'Client completed 2 online applications for local retail and warehouse positions, printed 5 updated resume copies, and verbalized increased confidence for upcoming interviews.',
    planNextSteps: 'CPSS and client to conduct mock interview practice session next Monday at 1:00 PM.',
    recommendedInterventionChips: ['lived_exp', 'peer_mentor', 'resource_conn']
  },
  {
    id: 'calaim_somatic_regulation',
    title: 'Somatic Distress Tolerance & De-Escalation',
    category: 'Regulation',
    summary: 'In-the-moment somatic nervous system regulation (box breathing, 5-4-3-2-1 grounding) to prevent behavioral escalation or relapse.',
    modality: 'community_field',
    placeOfServiceCode: '15',
    locationDetails: 'Community green space / bench near client housing',
    focusDomains: ['Coping Skills', 'Mental Health Wellness', 'Relapse Prevention'],
    faceToFaceMinutes: 30,
    travelMinutes: 10,
    documentationMinutes: 10,
    goalAddressed: 'Client Recovery Careplan Goal 2: Utilize somatic regulation techniques during acute emotional spikes before acting on impulsive urges.',
    peerIntervention: 'CPSS met with client who was experiencing severe emotional agitation following family conflict. Offered empathetic listening and suggested trying 4-4-4-4 box breathing together. Guided client through 3 rounds of breathing, followed by 5-4-3-2-1 sensory grounding focusing on physical surroundings.',
    clientResponse: 'Client physical posture softened, speech rate normalized, and client reported distress level dropped from 9/10 to 3/10. Client noted sensory grounding helped break the panic loop.',
    planNextSteps: 'Client agreed to practice box breathing twice daily morning and evening; CPSS to send text check-in tomorrow at noon.',
    recommendedInterventionChips: ['somatic_breath', 'sensory_54321', 'lived_exp']
  }
];

interface H0038TemplateDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: H0038Template) => void;
}

export const H0038TemplateDrawer: React.FC<H0038TemplateDrawerProps> = ({
  isOpen,
  onClose,
  onSelectTemplate
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [expandedTemplateId, setExpandedTemplateId] = useState<string | null>(
    H0038_STANDARDIZED_TEMPLATES[0].id
  );

  const categories = ['All', 'Housing', 'Harm Reduction', 'Recovery', 'Crisis/WRAP', 'Re-Entry', 'ECM', 'Vocational', 'Regulation'];

  const filteredTemplates = useMemo(() => {
    return H0038_STANDARDIZED_TEMPLATES.filter((tmpl) => {
      const matchesCategory = selectedCategory === 'All' || tmpl.category === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !query ||
        tmpl.title.toLowerCase().includes(query) ||
        tmpl.summary.toLowerCase().includes(query) ||
        tmpl.goalAddressed.toLowerCase().includes(query) ||
        tmpl.peerIntervention.toLowerCase().includes(query) ||
        tmpl.focusDomains.some((d) => d.toLowerCase().includes(query));
      return matchesCategory && matchesQuery;
    });
  }, [searchQuery, selectedCategory]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-label="CalAIM H0038 Encounter Note Templates"
    >
      <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 text-slate-800 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#1E3A8A] to-blue-900 text-white flex items-start justify-between gap-4 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-teal-500/30 border border-teal-300/40 text-teal-200 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                CalAIM H0038 Template Library
              </span>
              <span className="text-xs font-mono text-blue-200">8 Standards</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight mt-1 text-white">
              Standardized Encounter Note Templates
            </h2>
            <p className="text-xs text-blue-100 max-w-lg mt-0.5 leading-relaxed">
              1-click insert pre-validated non-clinical 4-part DAP documentation aligned with Medi-Cal golden-thread requirements.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-blue-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
            title="Close template drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="p-3 sm:p-4 bg-slate-50 border-b border-slate-200 space-y-2.5 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by keyword, domain, or CalAIM service (e.g. Housing, Naloxone, ECM)..."
              className="w-full min-h-[44px] pl-10 pr-9 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-transparent"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`min-h-[36px] px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-[#0F766E] text-white shadow-xs'
                    : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Template List Body */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-3.5">
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-12 px-4 text-slate-500">
              <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="font-semibold text-slate-700">No matching templates found</p>
              <p className="text-xs text-slate-500 mt-1">Try a different keyword or reset category to 'All'.</p>
            </div>
          ) : (
            filteredTemplates.map((template) => {
              const isExpanded = expandedTemplateId === template.id;
              const totalMinutes =
                template.faceToFaceMinutes + template.travelMinutes + template.documentationMinutes;
              const units = Math.floor((totalMinutes + 7) / 15);

              return (
                <div
                  key={template.id}
                  className={`bg-white rounded-2xl border transition-all ${
                    isExpanded
                      ? 'border-[#0F766E] shadow-md ring-1 ring-[#0F766E]/20'
                      : 'border-slate-200 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  {/* Summary Header */}
                  <div className="p-4 flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-50 text-[#0F766E] border border-teal-200">
                          {template.category}
                        </span>
                        <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200 font-semibold">
                          POS {template.placeOfServiceCode} (Field)
                        </span>
                        <span className="text-xs text-slate-500 flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {totalMinutes}m ({units} {units === 1 ? 'unit' : 'units'})
                        </span>
                      </div>

                      <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                        {template.title}
                      </h3>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed line-clamp-2">
                        {template.summary}
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          onSelectTemplate(template);
                          onClose();
                        }}
                        className="min-h-[44px] px-4 py-2 bg-[#0F766E] hover:bg-teal-700 text-white rounded-full text-xs font-bold transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
                        title="Insert template directly into session note"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Insert</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setExpandedTemplateId(isExpanded ? null : template.id)}
                        className="min-h-[44px] px-2.5 py-2 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
                      >
                        {isExpanded ? 'Hide' : 'Details'}
                      </button>
                    </div>
                  </div>

                  {/* Expanded 4-Part Note Preview */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 bg-[#F8FAFC] p-4 sm:p-5 rounded-b-2xl space-y-3.5 text-xs">
                      {/* Focus Domains */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-bold text-slate-700 text-[11px] uppercase tracking-wider">
                          Domains:
                        </span>
                        {template.focusDomains.map((dom) => (
                          <span
                            key={dom}
                            className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 text-[11px] font-medium"
                          >
                            {dom}
                          </span>
                        ))}
                      </div>

                      {/* CalAIM 4-Part Grid */}
                      <div className="space-y-2.5">
                        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                          <p className="font-bold text-[#1E3A8A] text-[11px] uppercase tracking-wider mb-1 flex items-center gap-1">
                            <span className="w-4 h-4 rounded-full bg-blue-100 text-[#1E3A8A] flex items-center justify-center text-[10px] font-bold">1</span>
                            Recovery Careplan Goal Linkage
                          </p>
                          <p className="text-slate-700 leading-relaxed">{template.goalAddressed}</p>
                        </div>

                        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                          <p className="font-bold text-[#0F766E] text-[11px] uppercase tracking-wider mb-1 flex items-center gap-1">
                            <span className="w-4 h-4 rounded-full bg-teal-100 text-[#0F766E] flex items-center justify-center text-[10px] font-bold">2</span>
                            Peer Support Specialist Intervention
                          </p>
                          <p className="text-slate-700 leading-relaxed">{template.peerIntervention}</p>
                        </div>

                        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                          <p className="font-bold text-amber-800 text-[11px] uppercase tracking-wider mb-1 flex items-center gap-1">
                            <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-[10px] font-bold">3</span>
                            Client Response &amp; Observable Recovery Metric
                          </p>
                          <p className="text-slate-700 leading-relaxed">{template.clientResponse}</p>
                        </div>

                        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                          <p className="font-bold text-emerald-800 text-[11px] uppercase tracking-wider mb-1 flex items-center gap-1">
                            <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px] font-bold">4</span>
                            Collaborative Next Steps
                          </p>
                          <p className="text-slate-700 leading-relaxed">{template.planNextSteps}</p>
                        </div>
                      </div>

                      {/* Minutes breakdown */}
                      <div className="p-3 bg-white rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-slate-600 text-xs">
                        <span>Direct: <strong>{template.faceToFaceMinutes}m</strong></span>
                        <span>Travel: <strong>{template.travelMinutes}m</strong></span>
                        <span>Doc: <strong>{template.documentationMinutes}m</strong></span>
                        <span className="text-[#0F766E] font-bold">Total: {totalMinutes}m ({units} H0038 Units)</span>
                      </div>

                      {/* Apply button inside details */}
                      <div className="pt-1 flex justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            onSelectTemplate(template);
                            onClose();
                          }}
                          className="min-h-[44px] px-5 py-2.5 bg-[#0F766E] hover:bg-teal-700 text-white rounded-full text-xs font-bold transition-colors cursor-pointer shadow-xs flex items-center gap-2"
                        >
                          <Check className="w-4 h-4" />
                          <span>Insert Template into Current Note</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
            <span>CalAIM Non-Clinical Standard · Free Form Modification Allowed</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-full font-semibold transition-colors cursor-pointer text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
