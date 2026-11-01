#!/usr/bin/env node
/**
 * Peer Notebook - Git Conflict Auto-Resolution Engine
 * Scans files for Git merge conflict markers (<<<<<<< ... ======= ... >>>>>>>)
 * and resolves them automatically by preserving the most recently modified content.
 * 
 * Standard: H. Joe Abudayyeh Production & Engineering Standards
 * Copyright: © 2026-2027 H. Joe Abudayyeh & Peer Notebook LLC. All Rights Reserved.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const CONFLICT_START_REGEX = /^<{7}\s*(.*)$/m;
const CONFLICT_DIVIDER_REGEX = /^={7}$/m;
const CONFLICT_END_REGEX = /^>{7}\s*(.*)$/m;

// Directories to scan
const SCAN_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.css', '.html', '.sh', '.yml', '.yaml', '.sql'];
const IGNORE_DIRS = ['node_modules', '.git', 'dist', '.vercel', '.aistudio'];

let filesChecked = 0;
let conflictsResolved = 0;

function walkDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (IGNORE_DIRS.includes(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDir(fullPath);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (SCAN_EXTENSIONS.includes(ext) || entry.name.startsWith('.')) {
        checkAndResolveFile(fullPath);
      }
    }
  }
}

function checkAndResolveFile(filePath) {
  if (filePath === __filename) return;
  filesChecked++;
  const content = fs.readFileSync(filePath, 'utf-8');
  
  if (!content.includes('<<<<<<<') || !content.includes('=======')) {
    return;
  }

  console.log(`[CONFLICT RESOLVER] Found conflict markers in: ${path.relative(rootDir, filePath)}`);
  
  const lines = content.split('\n');
  const resolvedLines = [];
  let inConflict = false;
  let side = 'none'; // 'ours' or 'theirs'
  let oursLines = [];
  let theirsLines = [];
  let resolvedInThisFile = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith('<<<<<<<')) {
      inConflict = true;
      side = 'ours';
      oursLines = [];
      theirsLines = [];
      continue;
    }

    if (inConflict && line.startsWith('=======')) {
      side = 'theirs';
      continue;
    }

    if (inConflict && line.startsWith('>>>>>>>')) {
      inConflict = false;
      side = 'none';
      resolvedInThisFile++;
      conflictsResolved++;

      // Resolution policy: Keep the most recent/authoritative side (HEAD / ours)
      // which represents the latest modifications in the active development workspace.
      resolvedLines.push(...oursLines);
      oursLines = [];
      theirsLines = [];
      continue;
    }

    if (inConflict) {
      if (side === 'ours') {
        oursLines.push(line);
      } else if (side === 'theirs') {
        theirsLines.push(line);
      }
    } else {
      resolvedLines.push(line);
    }
  }

  if (resolvedInThisFile > 0) {
    fs.writeFileSync(filePath, resolvedLines.join('\n'), 'utf-8');
    console.log(`[CONFLICT RESOLVER] Successfully resolved ${resolvedInThisFile} conflict(s) in: ${path.relative(rootDir, filePath)}`);
  }
}

console.log('================================================================');
console.log('  PEER NOTEBOOK GIT CONFLICT RESOLUTION ENGINE');
console.log('  Mode: Retain Most Recently Modified Content (Workspace Canonical)');
console.log('================================================================');

walkDir(rootDir);

console.log('----------------------------------------------------------------');
console.log(`Summary: Checked ${filesChecked} files. Resolved ${conflictsResolved} conflict(s).`);
console.log('================================================================');
