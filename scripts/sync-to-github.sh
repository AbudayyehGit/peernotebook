#!/usr/bin/env bash
# Peer Notebook - Automated GitHub & Vercel Production Synchronization Tool
# Syncs current working directory state with origin remote to trigger automatic Vercel deployment on peernotebook.com
# Standard: H. Joe Abudayyeh Production & Engineering Standards
# Copyright: © 2026-2027 H. Joe Abudayyeh & Peer Notebook LLC. All Rights Reserved.

set -e

REPO_URL="${1:-$GITHUB_REPO}"
FORCE_PUSH="${FORCE_SYNC:-false}"

echo "================================================================"
echo "  PEER NOTEBOOK GIT REPOSITORY SYNCHRONIZATION ENGINE"
echo "  Target: Synchronize AI Studio Workspace -> GitHub -> Vercel"
echo "  Conflict Policy: Retain Most Recently Modified (Workspace Canonical)"
echo "================================================================"

# 1. Ensure Git repository exists and branch is main
if [ ! -d ".git" ]; then
  echo "Initializing git repository on branch 'main'..."
  git init -b main
else
  CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "main")
  if [ "$CURRENT_BRANCH" != "main" ] && [ "$CURRENT_BRANCH" != "master" ]; then
    echo "Switching to main branch..."
    git checkout -B main
  fi
fi

# 2. Configure standard Git parameters to prevent line-ending & merge conflicts
git config core.autocrlf false
git config core.eol lf
git config pull.rebase true
git config merge.conflictstyle zdiff3
git config rerere.enabled true

# Set standard committer info if not configured
if [ -z "$(git config user.name)" ]; then
  git config user.name "H. Joe Abudayyeh"
fi
if [ -z "$(git config user.email)" ]; then
  git config user.email "support@peernotebook.com"
fi

# 3. Scan and auto-resolve any lingering merge conflict markers across the workspace
echo "Scanning for and resolving any merge conflict markers..."
node scripts/resolve-git-conflicts.js

# 4. Synchronize documentation structure and checklists
if [ -f "scripts/syncDocsToDisk.js" ]; then
  node scripts/syncDocsToDisk.js
fi

# 5. Pre-flight verification (TypeScript compilation check)
echo "Running pre-flight TypeScript lint check..."
npm run lint

# 6. Stage all project files according to .gitignore and .gitattributes
echo "Staging all project files..."
git add -A

# 7. Create commit if working tree has changes
if git diff-index --quiet HEAD -- 2>/dev/null; then
  echo "Working tree is clean. No new uncommitted changes."
else
  COMMIT_MSG="feat(release): synchronize GA #8 production release with peernotebook.com [$(date -u +%Y-%m-%dT%H:%M:%SZ)]"
  echo "Creating commit: $COMMIT_MSG"
  git commit -m "$COMMIT_MSG"
fi

# 8. Check origin remote
CURRENT_REMOTE=$(git remote get-url origin 2>/dev/null || echo "")

if [ -n "$REPO_URL" ]; then
  if [ -n "$CURRENT_REMOTE" ]; then
    echo "Updating origin remote to: $REPO_URL"
    git remote set-url origin "$REPO_URL"
  else
    echo "Setting origin remote to: $REPO_URL"
    git remote add origin "$REPO_URL"
  fi
  CURRENT_REMOTE="$REPO_URL"
fi

if [ -z "$CURRENT_REMOTE" ]; then
  echo ""
  echo "----------------------------------------------------------------"
  echo "NOTICE: No Git remote 'origin' is currently configured."
  echo "----------------------------------------------------------------"
  echo "To push this pristine release directly to GitHub and synchronize"
  echo "peernotebook.com via Vercel, run one of the following commands:"
  echo ""
  echo "  1) Via this sync script:"
  echo "     npm run git:sync -- https://github.com/YOUR_USERNAME/peernotebook.git"
  echo ""
  echo "  2) Or via standard Git CLI:"
  echo "     git remote add origin https://github.com/YOUR_USERNAME/peernotebook.git"
  echo "     git push -u origin main"
  echo "----------------------------------------------------------------"
  exit 0
fi

# 9. Smart Remote Reconcile & Conflict Resolution
echo "Fetching origin main to detect divergence..."
if git ls-remote --exit-code origin main >/dev/null 2>&1; then
  echo "Remote branch 'origin/main' found. Fetching..."
  git fetch origin main || true

  # Check if remote branch has diverged
  LOCAL_COMMIT=$(git rev-parse HEAD 2>/dev/null || echo "")
  REMOTE_COMMIT=$(git rev-parse origin/main 2>/dev/null || echo "")

  if [ "$LOCAL_COMMIT" != "$REMOTE_COMMIT" ] && [ -n "$REMOTE_COMMIT" ]; then
    echo "Reconciling divergent commits using canonical workspace resolution (keeping latest files)..."
    # Attempt rebase favoring local changes (ours/theirs in rebase semantics: -X theirs preserves current branch)
    git rebase -X theirs origin/main || {
      echo "Conflict detected during rebase. Running auto-resolution engine..."
      node scripts/resolve-git-conflicts.js
      git add -A
      git -c core.editor=true rebase --continue || {
        echo "Rebase failed. Aborting rebase and performing smart merge with conflict resolution..."
        git rebase --abort 2>/dev/null || true
        git merge -X ours origin/main -m "merge: resolve GitHub sync divergence by keeping most recently modified files" || {
          node scripts/resolve-git-conflicts.js
          git add -A
          git commit -m "merge: auto-resolved conflict markers favoring canonical workspace state"
        }
      }
    }
  fi
fi

# 10. Push latest commits to origin main
echo "Pushing canonical codebase to origin main ($CURRENT_REMOTE)..."
if [ "$FORCE_PUSH" = "true" ]; then
  git push --force-with-lease -u origin main
else
  git push -u origin main || {
    echo "Standard push failed. Prompting for authoritative force-with-lease or check remote permissions."
    echo "To push canonical state forcefully: FORCE_SYNC=true npm run git:sync"
    exit 1
  }
fi

echo ""
echo "================================================================"
echo "SUCCESS: Latest codebase synchronized with GitHub!"
echo "Vercel will now automatically trigger a production build for peernotebook.com."
echo "================================================================"
