#!/usr/bin/env bash
# Rebuild the site and publish it to the gh-pages branch (GitHub Pages).
set -euo pipefail

cd "$(dirname "$0")"

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Error: not a git repository. gh-pages needs a clone with an 'origin' remote." >&2
  exit 1
fi

if ! git remote get-url origin >/dev/null 2>&1; then
  echo "Error: no 'origin' remote configured." >&2
  exit 1
fi

if [ ! -d node_modules ]; then
  echo "Installing dependencies..."
  npm install
fi

echo "Building and deploying (npm run deploy)..."
npm run deploy

echo "Done. Live shortly at: https://josh-abraham.github.io/hyggetime"
