#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUTPUT_DIR="$ROOT_DIR/private/starter-pack"
SOURCE_DIR="$ROOT_DIR/private/starter-pack-source"
ZIP_PATH="$ROOT_DIR/private/jira-agile-starter-pack.zip"

rm -rf "$OUTPUT_DIR" "$ZIP_PATH"
mkdir -p "$OUTPUT_DIR/templates" "$OUTPUT_DIR/checklists" "$OUTPUT_DIR/guides"

cp "$ROOT_DIR/src/content/templates/user-story-template.mdx" "$OUTPUT_DIR/templates/user-story-template.md"
cp "$ROOT_DIR/src/content/templates/jira-bug-report-template.mdx" "$OUTPUT_DIR/templates/jira-bug-report-template.md"
cp "$ROOT_DIR/src/content/templates/feature-request-template.mdx" "$OUTPUT_DIR/templates/feature-request-template.md"
cp "$ROOT_DIR/src/content/templates/acceptance-criteria-template.mdx" "$OUTPUT_DIR/templates/acceptance-criteria-template.md"
cp "$ROOT_DIR/src/content/templates/definition-of-ready-template.mdx" "$OUTPUT_DIR/checklists/definition-of-ready.md"
cp "$ROOT_DIR/src/content/templates/definition-of-done-checklist.mdx" "$OUTPUT_DIR/checklists/definition-of-done.md"
cp "$ROOT_DIR/src/content/templates/sprint-planning-template.mdx" "$OUTPUT_DIR/templates/sprint-planning-template.md"
cp "$ROOT_DIR/src/content/templates/sprint-retrospective-template.mdx" "$OUTPUT_DIR/templates/sprint-retrospective-template.md"
cp "$ROOT_DIR/src/content/guides/complete-guide-to-jira-ticket-quality.mdx" "$OUTPUT_DIR/guides/jira-ticket-quality-guide.md"

cp "$SOURCE_DIR/AI_PROMPTS.md" "$OUTPUT_DIR/AI_PROMPTS.md"
cp "$SOURCE_DIR/README.md" "$OUTPUT_DIR/README.md"

(cd "$ROOT_DIR/private" && zip -qr "$(basename "$ZIP_PATH")" "$(basename "$OUTPUT_DIR")")
printf 'Created %s\n' "$ZIP_PATH"
