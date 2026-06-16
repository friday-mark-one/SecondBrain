#!/bin/bash

MD_SOURCE="/Users/openclaw/SecondBrain/agent-protocol/"
MD_DEST="/Users/openclaw/.openclaw/workspace/"

echo "Running initial sync..."

# 1. Initial sync: Obsidian -> Workspace (Only .md files)
rsync -av --include='*.md' --exclude='*' "$MD_SOURCE" "$MD_DEST"

# Obsidian -> Workspace (.md files only)
fswatch -o "$MD_SOURCE" -e ".*" -i "\\.md$" | while read f; do
    echo "Detected change in agent-protocol. Syncing to workspace..."
    rsync -av --include='*.md' --exclude='*' "$MD_SOURCE" "$MD_DEST"
done
