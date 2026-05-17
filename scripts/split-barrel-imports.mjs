#!/usr/bin/env node
/**
 * Split bare-barrel imports from the soon-to-be-deleted @tiptap/extension-list
 * and @tiptap/extensions packages into specific @tiptap/editor subpath imports.
 *
 *   import { BulletList, ListItem } from '@tiptap/extension-list'
 *     becomes
 *   import { BulletList } from '@tiptap/editor/nodes/bullet-list'
 *   import { ListItem } from '@tiptap/editor/nodes/list-item'
 *
 * Handles type-only imports (`import type {...}`) and inline `type X` modifiers.
 * Skips files inside the packages being deleted.
 *
 * Usage: node scripts/split-barrel-imports.mjs
 */

import { readFileSync, writeFileSync, statSync } from 'node:fs'
import { execSync } from 'node:child_process'

const SYMBOL_MAP = {
  // @tiptap/extension-list members
  BulletList: '@tiptap/editor/nodes/bullet-list',
  BulletListOptions: '@tiptap/editor/nodes/bullet-list',
  bulletListInputRegex: '@tiptap/editor/nodes/bullet-list',
  OrderedList: '@tiptap/editor/nodes/ordered-list',
  OrderedListOptions: '@tiptap/editor/nodes/ordered-list',
  orderedListInputRegex: '@tiptap/editor/nodes/ordered-list',
  ListItem: '@tiptap/editor/nodes/list-item',
  ListItemOptions: '@tiptap/editor/nodes/list-item',
  TaskList: '@tiptap/editor/nodes/task-list',
  TaskListOptions: '@tiptap/editor/nodes/task-list',
  TaskItem: '@tiptap/editor/nodes/task-item',
  TaskItemOptions: '@tiptap/editor/nodes/task-item',
  ListKeymap: '@tiptap/editor/extensions/list-keymap',
  ListKeymapOptions: '@tiptap/editor/extensions/list-keymap',
  ListKit: '@tiptap/editor/kits/list',
  ListKitOptions: '@tiptap/editor/kits/list',

  // @tiptap/extensions members
  CharacterCount: '@tiptap/editor/extensions/character-count',
  CharacterCountOptions: '@tiptap/editor/extensions/character-count',
  CharacterCountStorage: '@tiptap/editor/extensions/character-count',
  Dropcursor: '@tiptap/editor/extensions/dropcursor',
  DropcursorOptions: '@tiptap/editor/extensions/dropcursor',
  Focus: '@tiptap/editor/extensions/focus',
  FocusOptions: '@tiptap/editor/extensions/focus',
  Gapcursor: '@tiptap/editor/extensions/gapcursor',
  Placeholder: '@tiptap/editor/extensions/placeholder',
  PlaceholderOptions: '@tiptap/editor/extensions/placeholder',
  preparePlaceholderAttribute: '@tiptap/editor/extensions/placeholder',
  Selection: '@tiptap/editor/extensions/selection',
  SelectionOptions: '@tiptap/editor/extensions/selection',
  TrailingNode: '@tiptap/editor/extensions/trailing-node',
  TrailingNodeOptions: '@tiptap/editor/extensions/trailing-node',
  skipTrailingNodeMeta: '@tiptap/editor/extensions/trailing-node',
  UndoRedo: '@tiptap/editor/extensions/history',
  UndoRedoOptions: '@tiptap/editor/extensions/history',
}

const BARREL_PACKAGES = new Set(['@tiptap/extension-list', '@tiptap/extensions'])

const IMPORT_RE = /(^[ \t]*import\s+(type\s+)?\{([^}]+)\}\s+from\s+['"`])([^'"`]+)(['"`][^\n]*)/gm

function transformText(text, filePath) {
  let changed = false
  const out = text.replace(IMPORT_RE, (match, lead, typePrefix, body, source, trail) => {
    if (!BARREL_PACKAGES.has(source)) return match
    const isTypeImport = Boolean(typePrefix)
    const indent = (lead.match(/^[ \t]*/) || [''])[0]

    const namedSpecs = body
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)

    // Group specs by target subpath.
    const groups = new Map() // subpath -> Array<{ raw, isType }>
    const unknown = []
    for (const spec of namedSpecs) {
      // spec like "X" or "X as Y" or "type X" or "type X as Y"
      const inlineTypeMatch = spec.match(/^type\s+(.+)$/)
      const inline = Boolean(inlineTypeMatch)
      const remainder = inline ? inlineTypeMatch[1] : spec
      const aliasMatch = remainder.match(/^(\w+)(\s+as\s+\w+)?$/)
      if (!aliasMatch) {
        unknown.push(spec)
        continue
      }
      const orig = aliasMatch[1]
      const target = SYMBOL_MAP[orig]
      if (!target) {
        unknown.push(spec)
        continue
      }
      if (!groups.has(target)) groups.set(target, [])
      groups.get(target).push({ raw: remainder, isInlineType: inline })
    }
    if (groups.size === 0 || unknown.length > 0) {
      console.warn(
        `[split-barrel] could not fully rewrite "${match.trim()}" in ${filePath} — unknown: ${unknown.join(', ')}`,
      )
      return match
    }

    changed = true
    const lines = []
    for (const [subpath, specs] of groups) {
      // If the original was `import type {...}`, emit `import type {...}` for the new lines too.
      // Otherwise preserve any inline `type X` specifiers.
      const allInlineTypes = specs.every(s => s.isInlineType)
      if (isTypeImport || allInlineTypes) {
        // Collapse to `import type { ... }`
        const cleanSpecs = specs.map(s => s.raw).join(', ')
        lines.push(`${indent}import type { ${cleanSpecs} } from '${subpath}'`)
      } else {
        // Mixed: emit with inline `type` markers preserved.
        const specStr = specs.map(s => (s.isInlineType ? `type ${s.raw}` : s.raw)).join(', ')
        lines.push(`${indent}import { ${specStr} } from '${subpath}'`)
      }
    }
    return lines.join('\n')
  })

  return [changed, out]
}

function fileList() {
  const out = execSync(
    `grep -rlE "from ['\\"](@tiptap/extension-list|@tiptap/extensions)['\\"]" /home/user/tiptap/packages /home/user/tiptap/packages-deprecated /home/user/tiptap/demos /home/user/tiptap/tests --include='*.ts' --include='*.tsx' --include='*.jsx' --include='*.js' --include='*.vue' --include='*.svelte' 2>/dev/null || true`,
  )
    .toString()
    .split('\n')
    .filter(Boolean)
    .filter(p => !p.includes('/node_modules/'))
    .filter(p => !p.includes('/dist/'))
    .filter(p => !p.includes('/packages/extension-list/'))
    .filter(p => !p.includes('/packages/extensions/'))
    .filter(p => !p.includes('/packages/starter-kit/'))
    .filter(p => !p.includes('/packages/extension-bullet-list/'))
    .filter(p => !p.includes('/packages/extension-ordered-list/'))
  return out
}

const files = fileList()
console.log(`scanning ${files.length} files...`)
let rewriteCount = 0
for (const f of files) {
  try {
    const text = readFileSync(f, 'utf8')
    const [changed, next] = transformText(text, f)
    if (changed) {
      writeFileSync(f, next)
      rewriteCount += 1
    }
  } catch (err) {
    console.warn(`[split-barrel] error on ${f}: ${err.message}`)
  }
}
console.log(`rewrote ${rewriteCount} files`)
