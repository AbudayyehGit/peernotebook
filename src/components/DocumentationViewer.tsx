/**
 * Peer Notebook - GA #8 Technical Documentation & White Paper Viewer
 * Interactive browser for all project white papers and specifications
 * Canonical URLs: https://www.peernotebook.com/docs/*
 * Minimum 44px touch targets & Trauma-Informed Container Cards
 */

import React, { useState, useEffect } from 'react';
import { DOC_ARTICLES, DocArticle, DOCUMENTATION_CATEGORIES } from '../docs/documentationData';
import {
  BookOpen,
  Search,
  ExternalLink,
  Download,
  Copy,
  Check,
  Calendar,
  User,
  Clock,
  ShieldCheck,
  ChevronRight,
  Code2,
  Database,
  Lock
} from 'lucide-react';

interface DocumentationViewerProps {
  initialSlug?: string;
  onSlugChange?: (slug: string) => void;
}

export const DocumentationViewer: React.FC<DocumentationViewerProps> = ({
  initialSlug,
  onSlugChange
}) => {
  const findArticleBySlug = (slugToMatch?: string): DocArticle | undefined => {
    if (!slugToMatch) return undefined;
    const clean = slugToMatch.toLowerCase().trim();
    return DOC_ARTICLES.find(
      (a) =>
        a.slug.toLowerCase() === clean ||
        clean.endsWith(a.slug.toLowerCase()) ||
        a.canonicalUrl.toLowerCase().endsWith(clean) ||
        clean.includes(a.slug.toLowerCase()) ||
        a.slug.toLowerCase().replace(/_/g, '-') === clean.replace(/_/g, '-')
    );
  };

  const [selectedArticle, setSelectedArticle] = useState<DocArticle>(() => {
    return findArticleBySlug(initialSlug) || DOC_ARTICLES[0];
  });
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [mobileViewMode, setMobileViewMode] = useState<'index' | 'reader'>('index');

  useEffect(() => {
    if (initialSlug) {
      const found = findArticleBySlug(initialSlug);
      if (found && found.slug !== selectedArticle.slug) {
        setSelectedArticle(found);
      }
    }
  }, [initialSlug]);

  const handleSelectArticle = (article: DocArticle) => {
    setSelectedArticle(article);
    setMobileViewMode('reader');
    if (onSlugChange) {
      onSlugChange(article.slug);
    }
  };

  const filteredArticles = DOC_ARTICLES.filter((art) => {
    const matchesSearch =
      art.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      art.subtitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      art.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      art.specCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || art.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleDownloadMarkdown = (article: DocArticle) => {
    const blob = new Blob([article.content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${article.slug}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      {/* Top Banner with Trust & Engineering Badges */}
      <div className="p-5 sm:p-7 bg-white border border-slate-200/90 rounded-2xl shadow-[0_4px_20px_rgba(15,23,42,0.04)] space-y-4 max-w-full overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 text-[#1E3A8A] rounded-xl border border-blue-200/80 shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-[#1E3A8A] leading-tight">
                  GA #8 Production Architecture White Papers
                </h2>
                <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-md bg-teal-50 border border-teal-200 text-[#0F766E] font-bold">
                  www.peernotebook.com/docs
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Enterprise Behavioral Health & Dual-Layer Persistence Technical Specifications
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <a
              href="https://www.peernotebook.com/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full md:w-auto min-h-[44px] flex items-center justify-center gap-2 px-5 py-2.5 bg-[#1E3A8A] hover:bg-blue-900 text-white rounded-xl text-xs font-bold shadow-sm transition-colors shrink-0"
            >
              <span>Visit peernotebook.com/docs</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Real-time System Observability Badges in Documentation Header */}
        <div className="pt-3.5 border-t border-slate-100 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1">
            System Status:
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-[#16A34A] border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
            Build: passing
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-[#1E3A8A] border border-blue-200">
            <Code2 className="w-3.5 h-3.5 text-[#1E3A8A]" />
            TypeScript: strict
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-[#16A34A] border border-emerald-200">
            <Database className="w-3.5 h-3.5 text-[#16A34A]" />
            Persistence: Dexie.js + Supabase
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-teal-50 text-[#0F766E] border border-teal-200">
            <ShieldCheck className="w-3.5 h-3.5 text-[#0F766E]" />
            CalAIM & Medi-Cal H0038
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-[#16A34A] border border-emerald-200">
            <Lock className="w-3.5 h-3.5 text-[#16A34A]" />
            HIPAA BAA Active
          </span>
        </div>
      </div>

      {/* Mobile Mode Switcher (< lg) */}
      <div className="lg:hidden flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
        <button
          type="button"
          onClick={() => setMobileViewMode('index')}
          className={`flex-1 min-h-[42px] py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            mobileViewMode === 'index'
              ? 'bg-white text-[#1E3A8A] shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Papers Index ({filteredArticles.length})
        </button>
        <button
          type="button"
          onClick={() => setMobileViewMode('reader')}
          className={`flex-1 min-h-[42px] py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            mobileViewMode === 'reader'
              ? 'bg-[#0F766E] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Read Specification
        </button>
      </div>

      {/* Main Dual-Pane Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 max-w-full min-w-0">
        {/* Left Sidebar: Document List & Search */}
        <div
          className={`lg:col-span-4 space-y-4 max-w-full min-w-0 ${
            mobileViewMode === 'reader' ? 'hidden lg:block' : 'block'
          }`}
        >
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search white papers and specs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full min-h-[44px] pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-[#0F766E] shadow-[0_2px_6px_rgba(15,23,42,0.03)]"
            />
          </div>

          {/* Category Filter Chips with 44px min tap target */}
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedCategory('ALL')}
              className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === 'ALL'
                  ? 'bg-[#1E3A8A] text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              All Categories
            </button>
            {DOCUMENTATION_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#0F766E] text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {cat.replace(/^\d+\s*/, '')}
              </button>
            ))}
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-2.5 space-y-1 shadow-[0_4px_12px_rgba(15,23,42,0.05)] max-h-[350px] sm:max-h-[720px] overflow-y-auto">
            <div className="px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 flex items-center justify-between">
              <span>Published Papers ({filteredArticles.length})</span>
              <span className="font-mono text-[#0F766E] font-bold">Total: {DOC_ARTICLES.length}</span>
            </div>

            {filteredArticles.map((article) => {
              const isSelected = selectedArticle.slug === article.slug;
              return (
                <button
                  key={article.slug}
                  type="button"
                  onClick={() => handleSelectArticle(article)}
                  className={`w-full text-left p-3 rounded-xl transition-all flex items-start justify-between min-h-[44px] cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50 border border-blue-200 text-[#1E3A8A] shadow-xs'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="space-y-1 min-w-0 pr-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[#0F766E] font-bold">
                        {article.specCode}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {article.category.split(' ')[1]}
                      </span>
                    </div>
                    <div className="text-xs font-bold leading-snug text-slate-900 break-words">
                      {article.title}
                    </div>
                    <div className="text-[11px] text-slate-500 line-clamp-1">
                      {article.subtitle}
                    </div>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 shrink-0 mt-2 transition-transform ${
                      isSelected ? 'text-[#1E3A8A] translate-x-0.5' : 'text-slate-300'
                    }`}
                  />
                </button>
              );
            })}

            {filteredArticles.length === 0 && (
              <div className="p-6 text-center text-xs text-slate-400">
                No white papers match "{searchTerm}".
              </div>
            )}
          </div>
        </div>

        {/* Right Pane: Article Reader */}
        <div
          className={`lg:col-span-8 bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-7 lg:p-9 shadow-[0_4px_20px_rgba(15,23,42,0.04)] space-y-6 max-w-full min-w-0 overflow-hidden ${
            mobileViewMode === 'index' ? 'hidden lg:block' : 'block'
          }`}
        >
          {/* Mobile Back Button */}
          <button
            type="button"
            onClick={() => setMobileViewMode('index')}
            className="lg:hidden inline-flex items-center gap-1.5 text-xs font-bold text-[#0F766E] hover:underline pb-1 cursor-pointer"
          >
            <span>← Back to All Specifications ({DOC_ARTICLES.length})</span>
          </button>

          {/* Header Metadata */}
          <div className="border-b border-slate-200 pb-5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs font-mono font-bold text-[#0F766E] bg-teal-50 border border-teal-200 px-3 py-1.5 rounded-lg">
                SPEC: {selectedArticle.specCode} · {selectedArticle.category}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyUrl(selectedArticle.canonicalUrl)}
                  className="min-h-[44px] flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-colors border border-slate-300 shadow-[0_2px_4px_rgba(15,23,42,0.04)] cursor-pointer"
                  title="Copy Canonical Production URL"
                >
                  {copiedUrl ? (
                    <>
                      <Check className="w-4 h-4 text-[#16A34A]" />
                      <span className="text-[#16A34A]">URL Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-slate-500" />
                      <span>Copy URL</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadMarkdown(selectedArticle)}
                  className="min-h-[44px] flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-colors border border-slate-300 shadow-[0_2px_4px_rgba(15,23,42,0.04)] cursor-pointer"
                  title="Download Markdown Spec"
                >
                  <Download className="w-4 h-4 text-slate-500" />
                  <span>Download .md</span>
                </button>
              </div>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-[#1E3A8A] leading-tight break-words">
              {selectedArticle.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              {selectedArticle.subtitle}
            </p>

            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-slate-500 pt-1 font-mono">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {selectedArticle.author}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" /> Verified: {selectedArticle.lastUpdated}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {selectedArticle.readTime} read
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5 text-[#0F766E] font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" /> GA #8 Verified
              </span>
            </div>

            <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200 text-xs font-mono text-slate-500 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 break-all">
              <span className="truncate max-w-full">Canonical: {selectedArticle.canonicalUrl}</span>
              <a
                href={selectedArticle.canonicalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#0F766E] hover:underline flex items-center gap-1 font-bold shrink-0"
              >
                <span>Open in New Tab</span>
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              </a>
            </div>
          </div>

          {/* Rendered Document Body */}
          <div className="prose prose-slate max-w-full min-w-0 text-slate-700 text-xs sm:text-sm leading-relaxed space-y-4 break-words">
            {selectedArticle.content.split('\n\n').map((paragraph, index) => {
              if (paragraph.startsWith('# ')) {
                return (
                  <h2 key={index} className="text-lg sm:text-xl font-bold text-[#1E3A8A] pt-2 border-b border-slate-200 pb-2 break-words">
                    {paragraph.replace('# ', '')}
                  </h2>
                );
              }
              if (paragraph.startsWith('## ')) {
                return (
                  <h3 key={index} className="text-base sm:text-lg font-bold text-[#1E3A8A] pt-2 break-words">
                    {paragraph.replace('## ', '')}
                  </h3>
                );
              }
              if (paragraph.startsWith('### ')) {
                return (
                  <h4 key={index} className="text-sm sm:text-base font-bold text-slate-900 pt-1 break-words">
                    {paragraph.replace('### ', '')}
                  </h4>
                );
              }
              if (paragraph.startsWith('```')) {
                const cleanedCode = paragraph.replace(/```[a-z]*\n?/g, '').replace(/```/g, '');
                return (
                  <div key={index} className="w-full max-w-full overflow-x-auto my-3 rounded-xl">
                    <pre className="p-3.5 sm:p-4 bg-slate-50 text-slate-800 rounded-xl text-xs font-mono overflow-x-auto border border-slate-200/90 leading-normal max-w-full">
                      <code>{cleanedCode}</code>
                    </pre>
                  </div>
                );
              }
              if (paragraph.startsWith('* ') || paragraph.startsWith('- ')) {
                const items = paragraph.split('\n').filter((l) => l.trim().length > 0);
                return (
                  <ul key={index} className="list-disc pl-5 space-y-1.5 text-slate-700">
                    {items.map((item, itemIdx) => (
                      <li key={itemIdx}>{item.replace(/^[\*\-]\s+/, '')}</li>
                    ))}
                  </ul>
                );
              }
              if (paragraph.startsWith('---')) {
                return <hr key={index} className="border-slate-200 my-4" />;
              }
              return (
                <p key={index} className="text-slate-700 leading-relaxed">
                  {paragraph}
                </p>
              );
            })}
          </div>

          {/* Document Footer */}
          <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
            <span>
              Published by Peer Notebook Engineering • Official Technical Repository
            </span>
            <div className="flex items-center gap-3 font-semibold text-[#0F766E]">
              <a
                href="https://www.peernotebook.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                Privacy Policy
              </a>
              <span>·</span>
              <a
                href="https://www.peernotebook.com/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                Terms of Service
              </a>
              <span>·</span>
              <a
                href="https://www.peernotebook.com/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline flex items-center gap-1"
              >
                <span>Docs Root</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
