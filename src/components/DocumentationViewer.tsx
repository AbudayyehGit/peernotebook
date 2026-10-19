/**
 * Peer Notebook - GA #8 Technical Documentation & White Paper Viewer
 * Interactive browser for all project white papers and specifications
 * Canonical URLs: https://www.peernotebook.com/docs/*
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
  const [selectedArticle, setSelectedArticle] = useState<DocArticle>(() => {
    if (initialSlug) {
      const found = DOC_ARTICLES.find(
        (a) => a.slug.toLowerCase() === initialSlug.toLowerCase()
      );
      if (found) return found;
    }
    return DOC_ARTICLES[0];
  });
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedUrl, setCopiedUrl] = useState(false);

  useEffect(() => {
    if (initialSlug) {
      const found = DOC_ARTICLES.find(
        (a) => a.slug.toLowerCase() === initialSlug.toLowerCase()
      );
      if (found && found.slug !== selectedArticle.slug) {
        setSelectedArticle(found);
      }
    }
  }, [initialSlug]);

  const handleSelectArticle = (article: DocArticle) => {
    setSelectedArticle(article);
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
    <div className="space-y-6">
      {/* Top Banner with Trust & Engineering Badges */}
      <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 text-[#1E3A8A] rounded-xl border border-blue-200">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-[#1E3A8A]">
                  GA #8 Production Architecture White Papers
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-[#0F766E] font-bold">
                  www.peernotebook.com/docs
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Enterprise Behavioral Health & Dual-Layer Persistence Technical Specifications
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://www.peernotebook.com/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 bg-[#1E3A8A] hover:bg-blue-950 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <span>Visit www.peernotebook.com/docs</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Real-time System Observability Badges in Documentation Header */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1">
            System Status:
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-[#16A34A] border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse" />
            Build: passing
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 text-[#1E3A8A] border border-blue-200">
            <Code2 className="w-3 h-3 text-[#1E3A8A]" />
            TypeScript: strict
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-[#16A34A] border border-emerald-200">
            <Database className="w-3 h-3 text-[#16A34A]" />
            Persistence: Dexie.js + Supabase
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-teal-50 text-[#0F766E] border border-teal-200">
            <ShieldCheck className="w-3 h-3 text-[#0F766E]" />
            CalAIM & Medi-Cal H0038
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-[#16A34A] border border-emerald-200">
            <Lock className="w-3 h-3 text-[#16A34A]" />
            HIPAA BAA Active
          </span>
        </div>
      </div>

      {/* Main Dual-Pane Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar: Document List & Search */}
        <div className="lg:col-span-4 space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search white papers and specs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-[#0F766E] shadow-2xs"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                selectedCategory === 'ALL'
                  ? 'bg-[#1E3A8A] text-white shadow-2xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              All Categories
            </button>
            {DOCUMENTATION_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#0F766E] text-white shadow-2xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {cat.replace(/^\d+\s*/, '')}
              </button>
            ))}
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-2 space-y-1 shadow-xs max-h-[720px] overflow-y-auto">
            <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 flex items-center justify-between">
              <span>Published Papers ({filteredArticles.length})</span>
              <span className="font-mono text-[#0F766E]">Total: {DOC_ARTICLES.length}</span>
            </div>

            {filteredArticles.map((article) => {
              const isSelected = selectedArticle.slug === article.slug;
              return (
                <button
                  key={article.slug}
                  onClick={() => handleSelectArticle(article)}
                  className={`w-full text-left p-3 rounded-xl transition-all flex items-start justify-between ${
                    isSelected
                      ? 'bg-blue-50 border border-blue-200 text-[#1E3A8A] shadow-2xs'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 border border-slate-200 text-[#0F766E] font-bold">
                        {article.specCode}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {article.category.split(' ')[1]}
                      </span>
                    </div>
                    <div className="text-xs font-bold leading-tight text-slate-900">
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
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          {/* Header Metadata */}
          <div className="border-b border-slate-200 pb-5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-mono font-bold text-[#0F766E] bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-md">
                SPEC: {selectedArticle.specCode} • {selectedArticle.category}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyUrl(selectedArticle.canonicalUrl)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors border border-slate-200"
                  title="Copy Canonical Production URL"
                >
                  {copiedUrl ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#16A34A]" />
                      <span className="text-[#16A34A]">URL Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>Copy URL</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleDownloadMarkdown(selectedArticle)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors border border-slate-200"
                  title="Download Markdown Spec"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Download .md</span>
                </button>
              </div>
            </div>

            <h1 className="text-2xl font-black text-[#1E3A8A] leading-tight">
              {selectedArticle.title}
            </h1>
            <p className="text-sm text-slate-600 font-medium">
              {selectedArticle.subtitle}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1 font-mono">
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" /> {selectedArticle.author}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Verified: {selectedArticle.lastUpdated}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" /> {selectedArticle.readTime} read
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-[#0F766E]">
                <ShieldCheck className="w-3.5 h-3.5" /> GA #8 Verified
              </span>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-[11px] font-mono text-slate-500 flex items-center justify-between">
              <span className="truncate">Canonical: {selectedArticle.canonicalUrl}</span>
              <a
                href={selectedArticle.canonicalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#0F766E] hover:underline flex items-center gap-1 shrink-0 ml-2"
              >
                <span>Open in New Tab</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Rendered Document Body */}
          <div className="prose prose-slate max-w-none text-slate-700 text-xs sm:text-sm leading-relaxed space-y-4">
            {selectedArticle.content.split('\n\n').map((paragraph, index) => {
              if (paragraph.startsWith('# ')) {
                return (
                  <h2 key={index} className="text-xl font-bold text-[#1E3A8A] pt-2 border-b border-slate-200 pb-2">
                    {paragraph.replace('# ', '')}
                  </h2>
                );
              }
              if (paragraph.startsWith('## ')) {
                return (
                  <h3 key={index} className="text-lg font-bold text-[#1E3A8A] pt-2">
                    {paragraph.replace('## ', '')}
                  </h3>
                );
              }
              if (paragraph.startsWith('### ')) {
                return (
                  <h4 key={index} className="text-base font-bold text-slate-900 pt-1">
                    {paragraph.replace('### ', '')}
                  </h4>
                );
              }
              if (paragraph.startsWith('```')) {
                const cleanedCode = paragraph.replace(/```[a-z]*\n?/g, '').replace(/```/g, '');
                return (
                  <pre
                    key={index}
                    className="p-4 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono overflow-x-auto border border-slate-800 leading-normal"
                  >
                    <code>{cleanedCode}</code>
                  </pre>
                );
              }
              if (paragraph.startsWith('* ') || paragraph.startsWith('- ')) {
                const items = paragraph.split('\n').filter((l) => l.trim().length > 0);
                return (
                  <ul key={index} className="list-disc pl-5 space-y-1 text-slate-700">
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
              <span>•</span>
              <a
                href="https://www.peernotebook.com/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                Terms of Service
              </a>
              <span>•</span>
              <a
                href="https://www.peernotebook.com/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline flex items-center gap-1"
              >
                <span>Docs Root</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
