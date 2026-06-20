#!/usr/bin/env bash
set -euo pipefail

REPO="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO"

changed=0

# --- upstream (mattpocock/skills) ---
echo "Checking upstream (mattpocock/skills)..."
git fetch upstream

LOCAL_MAIN=$(git rev-parse HEAD)
UPSTREAM_HEAD=$(git rev-parse upstream/main)
MERGE_BASE=$(git merge-base HEAD upstream/main)

if [ "$UPSTREAM_HEAD" != "$MERGE_BASE" ]; then
  echo "  New changes found. Merging upstream/main..."
  git merge upstream/main -m "Merge upstream (mattpocock/skills)"
  changed=1
else
  echo "  Already up to date."
fi

# --- caveman (JuliusBrussee/caveman) ---
echo "Checking caveman (JuliusBrussee/caveman)..."
git fetch caveman

CAVEMAN_HEAD=$(git rev-parse caveman/main)
CAVEMAN_LAST=$(git log -1 --format='%H' -- vendors/caveman 2>/dev/null || echo "none")

SUBTREE_COMMIT=$(git log --format='%b' --grep='git-subtree-dir: vendors/caveman' 2>/dev/null \
  | sed -n 's/^git-subtree-split: //p' | head -1)

if [ -z "$SUBTREE_COMMIT" ] || [ "$SUBTREE_COMMIT" != "$CAVEMAN_HEAD" ]; then
  echo "  New changes found. Pulling caveman subtree..."
  if git subtree pull --prefix vendors/caveman caveman main --squash \
       -m "Update caveman subtree (JuliusBrussee/caveman)" 2>/dev/null; then
    changed=1
  else
    echo "  Already up to date."
  fi
else
  echo "  Already up to date."
fi

# --- regenerate if anything changed ---
if [ "$changed" = "1" ]; then
  echo "Regenerating plugin.json..."
  "$REPO/scripts/generate-plugin-json.sh"
  echo "Re-linking skills..."
  "$REPO/scripts/link-skills.sh"
  echo ""
  echo "Done. All remotes synced and skills updated."
else
  echo ""
  echo "Nothing to sync. Everything up to date."
fi
