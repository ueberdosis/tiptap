#!/usr/bin/env node
/**
 * Rewrite package.json dependency entries that referenced the now-deleted
 * @tiptap/extension-* / @tiptap/extensions / @tiptap/starter-kit packages.
 * Each such entry is replaced with a single `"@tiptap/editor": "workspace:^"`
 * entry on the same dep field (dependencies, devDependencies, peerDependencies).
 * Dedupes if the package already depends on @tiptap/editor.
 *
 * Skips /home/user/tiptap/packages/editor/package.json (it owns the new export).
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { globSync } from 'node:fs'

const DELETED = new Set([
  '@tiptap/extension-document',
  '@tiptap/extension-paragraph',
  '@tiptap/extension-text',
  '@tiptap/extension-heading',
  '@tiptap/extension-blockquote',
  '@tiptap/extension-code-block',
  '@tiptap/extension-hard-break',
  '@tiptap/extension-horizontal-rule',
  '@tiptap/extension-bold',
  '@tiptap/extension-italic',
  '@tiptap/extension-strike',
  '@tiptap/extension-code',
  '@tiptap/extension-link',
  '@tiptap/extension-underline',
  '@tiptap/extension-list',
  '@tiptap/extensions',
  '@tiptap/starter-kit',
])

const DEP_FIELDS = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies', 'peerDependenciesMeta']

function rewrite(filePath) {
  const raw = readFileSync(filePath, 'utf8')
  const pkg = JSON.parse(raw)

  let changed = false

  for (const field of DEP_FIELDS) {
    if (!pkg[field]) continue
    const original = pkg[field]
    const replacementSpec = Object.values(original).find(v => typeof v === 'string' && v.startsWith('workspace')) ?? 'workspace:^'
    let needsEditor = false
    const next = {}
    for (const [name, spec] of Object.entries(original)) {
      if (DELETED.has(name)) {
        needsEditor = true
        changed = true
        continue
      }
      next[name] = spec
    }
    if (needsEditor && !('@tiptap/editor' in next) && field !== 'peerDependenciesMeta') {
      next['@tiptap/editor'] = replacementSpec
    }
    if (changed) {
      // Sort keys alphabetically (matches the repo convention).
      const sorted = Object.fromEntries(Object.entries(next).sort(([a], [b]) => a.localeCompare(b)))
      pkg[field] = sorted
    }
  }

  if (changed) {
    writeFileSync(filePath, JSON.stringify(pkg, null, 2) + '\n')
    console.log('rewrote', filePath.replace('/home/user/tiptap/', ''))
  }
}

const files = globSync('/home/user/tiptap/{packages,packages-deprecated,demos}/**/package.json', {
  exclude: path => path.includes('/node_modules/') || path.includes('/dist/') || path === '/home/user/tiptap/packages/editor/package.json',
})

console.log(`scanning ${files.length} package.json files...`)
for (const f of files) {
  rewrite(f)
}
