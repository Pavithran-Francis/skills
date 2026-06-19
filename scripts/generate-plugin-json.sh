#!/usr/bin/env bash
set -euo pipefail

# Generates .claude-plugin/plugin.json by scanning skill directories.
# Excludes in-progress/ and deprecated/ buckets.
# Run after cloning or after merging upstream to pick up all skills
# (including personal ones) without manually editing plugin.json.

REPO="$(cd "$(dirname "$0")/.." && pwd)"
PLUGIN_JSON="$REPO/.claude-plugin/plugin.json"

skills=()
while IFS= read -r -d '' skill_md; do
  dir="$(dirname "$skill_md")"
  rel="./${dir#"$REPO"/}"
  skills+=("$rel")
done < <(find "$REPO/skills" "$REPO/vendors" -name SKILL.md \
  -not -path '*/node_modules/*' \
  -not -path '*/deprecated/*' \
  -not -path '*/in-progress/*' \
  -not -path '*/plugins/*' \
  -print0 | sort -z)

{
  echo '{'
  echo '  "name": "pavi-skills",'
  echo '  "skills": ['
  for i in "${!skills[@]}"; do
    if [ "$i" -lt $(( ${#skills[@]} - 1 )) ]; then
      echo "    \"${skills[$i]}\","
    else
      echo "    \"${skills[$i]}\""
    fi
  done
  echo '  ]'
  echo '}'
} > "$PLUGIN_JSON"

echo "Generated $PLUGIN_JSON with ${#skills[@]} skills"
