/**
 * Peer Notebook - California SB 803 & CalMHSA 17 Core Competencies Guide & Selector
 * Standard: California Senate Bill 803 (CPSS-CA Certification) & CalAIM H0038 Compliance
 * Features: Plain-English explanations, Documentation prompts, Search, and Session Note Tagging
 */

import React, { useState } from 'react';
import { SB_803_CORE_COMPETENCIES, SB803Competency } from '../data/sb803Competencies';
import {
  Award,
  BookOpen,
  CheckCircle2,
  Search,
  Tag,
  X,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Shield,
  HeartHandshake,
  Check
} from 'lucide-react';

interface SB803CompetencyGuideProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCompetencyIds?: string[];
  onToggleCompetency?: (id: string) => void;
  isSelectorMode?: boolean;
}

export const SB803CompetencyGuide: React.FC<SB803CompetencyGuideProps> = ({
  isOpen,
  onClose,
  selectedCompetencyIds = [],
  onToggleCompetency,
  isSelectorMode = false
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [activeCompetency, setActiveCompetency] = useState<SB803Competency | null>(null);

  if (!isOpen) return null;

  const categories = ['ALL', 'Foundation', 'Practice', 'Navigation', 'Ethics & Wellness'];

  const filteredCompetencies = SB_803_CORE_COMPETENCIES.filter((comp) => {
    const matchesCategory = activeCategory === 'ALL' || comp.category === activeCategory;
    const matchesSearch =
      comp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.plainEnglishDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.documentationPrompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs transition-opacity overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-4xl w-full shadow-2xl relative my-auto overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="bg-[#1E3A8A] text-white p-5 sm:p-6 flex items-start justify-between shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#0F766E] text-white">
                California SB 803 Mandate
              </span>
              <span className="text-xs text-blue-200 font-mono">CalMHSA CPSS-CA Standards</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              17 California Core Peer Competencies
            </h2>
            <p className="text-xs sm:text-sm text-blue-100/90 max-w-2xl">
              Mandated by California Senate Bill 803 for Medi-Cal H0038 Peer Support Services.
              Tag competencies demonstrated during your encounter to reinforce audit-proof CalAIM medical necessity.
            </p>
          </div>

          <button
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-blue-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0 ml-3"
            title="Close Guide"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Controls & Search */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 shrink-0 space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search competencies, prompts, keywords..."
                className="w-full min-h-[44px] pl-10 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-[#0F766E]"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    activeCategory === cat
                      ? 'bg-[#0F766E] text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {cat === 'ALL' ? 'All 17 Competencies' : cat}
                </button>
              ))}
            </div>
          </div>

          {isSelectorMode && (
            <div className="flex items-center justify-between text-xs text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200">
              <span>
                <strong>{selectedCompetencyIds.length}</strong> of 17 competencies tagged in current session note
              </span>
              <span className="text-[#0F766E] font-medium">Click any competency card to tag or untag</span>
            </div>
          )}
        </div>

        {/* Competencies Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredCompetencies.map((comp) => {
              const isSelected = selectedCompetencyIds.includes(comp.id);
              return (
                <div
                  key={comp.id}
                  onClick={() => {
                    if (isSelectorMode && onToggleCompetency) {
                      onToggleCompetency(comp.id);
                    } else {
                      setActiveCompetency(comp);
                    }
                  }}
                  className={`border rounded-xl p-4 transition-all cursor-pointer relative flex flex-col justify-between ${
                    isSelected
                      ? 'border-[#0F766E] bg-teal-50/50 ring-1 ring-[#0F766E]'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-[#1E3A8A] text-white text-xs font-bold flex items-center justify-center shrink-0">
                          {comp.number}
                        </span>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                          {comp.category}
                        </span>
                      </div>

                      {isSelectorMode && (
                        <button
                          type="button"
                          className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${
                            isSelected ? 'bg-[#0F766E] text-white' : 'border border-slate-300 text-transparent'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 mb-1">
                      {comp.title}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {comp.plainEnglishDescription}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[#0F766E] font-medium flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Documentation Prompt</span>
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveCompetency(comp);
                      }}
                      className="text-slate-400 hover:text-slate-700 flex items-center gap-0.5 cursor-pointer font-medium"
                    >
                      <span>Details</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredCompetencies.length === 0 && (
            <div className="text-center py-12 text-slate-500 space-y-2">
              <Award className="w-8 h-8 mx-auto text-slate-400" />
              <p className="text-sm font-semibold">No competencies match your search</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('ALL');
                }}
                className="text-xs text-[#0F766E] hover:underline"
              >
                Reset filters
              </button>
            </div>
          )}
        </div>

        {/* Detail Modal Overlay if a single competency is inspected */}
        {activeCompetency && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-xs p-6 z-20 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-sm bg-[#1E3A8A] text-white text-xs font-bold">
                      Competency #{activeCompetency.number}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 uppercase">
                      {activeCompetency.category}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">{activeCompetency.title}</h3>
                </div>
                <button
                  onClick={() => setActiveCompetency(null)}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-sm">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <h4 className="text-xs font-bold text-slate-700 uppercase mb-1">Plain-English Meaning</h4>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                    {activeCompetency.plainEnglishDescription}
                  </p>
                </div>

                <div className="p-3.5 bg-teal-50/60 rounded-xl border border-teal-200">
                  <h4 className="text-xs font-bold text-[#0F766E] uppercase mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>CalAIM H0038 Documentation Question</span>
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed italic">
                    "{activeCompetency.documentationPrompt}"
                  </p>
                </div>

                <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-200">
                  <h4 className="text-xs font-bold text-[#1E3A8A] uppercase mb-1">
                    CalAIM Billing & Audit Relevance
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                    {activeCompetency.calaimRelevance}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setActiveCompetency(null)}
                className="min-h-[44px] px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Back to List
              </button>

              {isSelectorMode && onToggleCompetency && (
                <button
                  type="button"
                  onClick={() => {
                    onToggleCompetency(activeCompetency.id);
                    setActiveCompetency(null);
                  }}
                  className={`min-h-[44px] px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-colors cursor-pointer flex items-center gap-2 ${
                    selectedCompetencyIds.includes(activeCompetency.id)
                      ? 'bg-rose-600 hover:bg-rose-700'
                      : 'bg-[#0F766E] hover:bg-teal-700'
                  }`}
                >
                  <Tag className="w-4 h-4" />
                  <span>
                    {selectedCompetencyIds.includes(activeCompetency.id)
                      ? 'Remove Tag from Note'
                      : 'Tag this Competency'}
                  </span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500">
            California Senate Bill 803 (Beall, 2020) · CalMHSA Peer Certification Standards
          </div>
          <button
            onClick={onClose}
            className="min-h-[44px] px-5 py-2 bg-[#1E3A8A] hover:bg-blue-900 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            {isSelectorMode ? 'Done Tagging' : 'Close Guide'}
          </button>
        </div>
      </div>
    </div>
  );
};
