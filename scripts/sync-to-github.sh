#!/usr/bin/env bash
# Peer Notebook - Automated GitHub & Vercel Production Synchronization Tool
# Syncs current working directory state with origin remote to trigger automatic Vercel deployment on peernotebook.com

set -e

REPO_URL="${1:-$GITHUB_REPO}"

echo "================================================================"
echo "  PEER NOTEBOOK GIT REPOSITORY SYNCHRONIZATION ENGINE"
echo "  Target: Synchronize AI Studio Workspace -> GitHub -> Vercel"
echo "================================================================"

# Ensure Git repository exists
if [ ! -d ".git" ]; then
  echo "Initializing git repository..."
  git init -b main
fi

# Set standard committer info if not configured
if [ -z "$(git config user.name)" ]; then
  git config user.name "Peer Notebook Engine"
fi
if [ -z "$(git config user.email)" ]; then
  git config user.email "support@peernotebook.com"
fi

# Stage all files according to .gitignore
echo "Staging all project files..."
git add -A

# Commit if there are changes
if git diff-index --quiet HEAD -- 2>/dev/null; then
  echo "Working tree is clean. No new uncommitted changes."
else
  COMMIT_MSG="feat(release): synchronize GA #8 production release with peernotebook.com [$(date -u +%Y-%m-%dT%H:%M:%SZ)]"
  echo "Creating commit: $COMMIT_MSG"
  git commit -m "$COMMIT_MSG"
fi

# Check origin remote
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

echo "Pushing latest commits to origin main ($CURRENT_REMOTE)..."
git push -u origin main

echo ""
echo "SUCCESS: Latest codebase pushed to GitHub!"
echo "Vercel will now automatically trigger a production build for peernotebook.com."
