#!/usr/bin/env bash
# Rewrite @tiptap/<deleted-pkg> imports to @tiptap/editor subpaths.
#
# Why this exists: Tiptap 4.0 consolidates ~17 lightweight extension packages
# into @tiptap/editor behind subpath exports. Consumers must update their
# imports. This script does that mechanically across the workspace.
#
# Safe to re-run. Idempotent: rewrites only the deleted-package names.
#
# Scope: every TS/TSX/JS/Vue/JSON file under packages, packages-deprecated,
# demos, tests, scripts (excluding the editor package itself and node_modules).

set -euo pipefail

ROOT="${1:-/home/user/tiptap}"

# Collect candidate files. Excludes node_modules, dist, the new editor
# package's own source, package.json files (handled separately because
# JSON dep keys map differently), and the lockfile.
mapfile -t FILES < <(
  find "$ROOT/packages" "$ROOT/packages-deprecated" "$ROOT/demos" "$ROOT/tests" "$ROOT/scripts" \
    \( -name node_modules -o -name dist -o -name '.turbo' \) -prune -o \
    -type f \
    \( -name '*.ts' -o -name '*.tsx' -o -name '*.js' -o -name '*.jsx' -o -name '*.vue' \) \
    -print 2>/dev/null \
    | grep -v '^'"$ROOT"'/packages/editor/' \
    | grep -v 'pnpm-lock.yaml'
)

echo "Candidate files: ${#FILES[@]}"

# Each entry: old=new. ORDER MATTERS:
#   1. Deepest/longest subpaths first (so they win before the root pattern).
#   2. Longest root names before shorter prefixes (-code-block before -code).
declare -a PAIRS=(
  # ---- specific subpaths in @tiptap/extension-list ----
  '@tiptap/extension-list/bullet-list=@tiptap/editor/nodes/bullet-list'
  '@tiptap/extension-list/ordered-list=@tiptap/editor/nodes/ordered-list'
  '@tiptap/extension-list/item=@tiptap/editor/nodes/list-item'
  '@tiptap/extension-list/task-list=@tiptap/editor/nodes/task-list'
  '@tiptap/extension-list/task-item=@tiptap/editor/nodes/task-item'
  '@tiptap/extension-list/keymap=@tiptap/editor/extensions/list-keymap'
  '@tiptap/extension-list/kit=@tiptap/editor/kits/list'
  # ---- specific subpaths in @tiptap/extensions ----
  '@tiptap/extensions/character-count=@tiptap/editor/extensions/character-count'
  '@tiptap/extensions/drop-cursor=@tiptap/editor/extensions/dropcursor'
  '@tiptap/extensions/focus=@tiptap/editor/extensions/focus'
  '@tiptap/extensions/gap-cursor=@tiptap/editor/extensions/gapcursor'
  '@tiptap/extensions/placeholder=@tiptap/editor/extensions/placeholder'
  '@tiptap/extensions/selection=@tiptap/editor/extensions/selection'
  '@tiptap/extensions/trailing-node=@tiptap/editor/extensions/trailing-node'
  '@tiptap/extensions/undo-redo=@tiptap/editor/extensions/history'
  # ---- root pkgs (longest before shortest where overlapping) ----
  '@tiptap/extension-code-block=@tiptap/editor/nodes/code-block'
  '@tiptap/extension-horizontal-rule=@tiptap/editor/nodes/horizontal-rule'
  '@tiptap/extension-hard-break=@tiptap/editor/nodes/hard-break'
  '@tiptap/extension-document=@tiptap/editor/nodes/document'
  '@tiptap/extension-paragraph=@tiptap/editor/nodes/paragraph'
  '@tiptap/extension-text=@tiptap/editor/nodes/text'
  '@tiptap/extension-heading=@tiptap/editor/nodes/heading'
  '@tiptap/extension-blockquote=@tiptap/editor/nodes/blockquote'
  '@tiptap/extension-bold=@tiptap/editor/marks/bold'
  '@tiptap/extension-italic=@tiptap/editor/marks/italic'
  '@tiptap/extension-strike=@tiptap/editor/marks/strike'
  '@tiptap/extension-code=@tiptap/editor/marks/code'
  '@tiptap/extension-link=@tiptap/editor/marks/link'
  '@tiptap/extension-underline=@tiptap/editor/marks/underline'
  '@tiptap/starter-kit=@tiptap/editor/kits/starter'
)

for pair in "${PAIRS[@]}"; do
  old="${pair%=*}"
  new="${pair#*=}"
  # Anchor the match: the package path is followed by a quote ', ", or `,
  # OR a forward slash that's NOT already a subpath we have a dedicated
  # rule for. Since subpath rules ran first, by the time we hit the root
  # pattern any remaining "@tiptap/extension-X/..." should not exist for
  # the listed pkgs (the deleted ones had no other subpaths). Still, anchor
  # to quote-only to be defensive.
  perl -pi -e 's|\Q'"$old"'\E(?=[\x27"`])|'"$new"'|g' "${FILES[@]}"
done

echo "Done."
