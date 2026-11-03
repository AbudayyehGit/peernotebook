/**
 * Peer Notebook - Lightweight Documentation Viewer
 * Conforms to ISO 9001 and W3C web standards
 * Visual Palette: Soft Slate (#F8FAFC), Deep Navy (#1E3A8A), Muted Teal (#0F766E)
 * Author: H. Joe Abudayyeh <joe@peernotebook.com>
 * Copyright © 2026-2027 H. Joe Abudayyeh & Peer Notebook LLC
 */

import React, { useEffect, useState } from 'react';

export interface DocViewerProps {
  path: string;
}

export function DocViewer({ path }: DocViewerProps) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const normalizedPath = path.replace(/^\/+/, '');
    fetch(`/docs/${normalizedPath}`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
      .then(text => {
        setContent(text);
        setLoading(false);
      })
      .catch(err => {
        setContent(`# Document Notice\n\nUnable to load \`/docs/${path}\`: ${err.message}`);
        setLoading(false);
      });
  }, [path]);

  return (
    <div className="prose max-w-none p-6 bg-white rounded-lg shadow border border-slate-200">
      {loading ? (
        <div className="text-sm text-slate-500 py-4 animate-pulse">Loading documentation...</div>
      ) : (
        <pre className="whitespace-pre-wrap font-sans text-sm text-slate-800 leading-relaxed overflow-x-auto">{content}</pre>
      )}
    </div>
  );
}
