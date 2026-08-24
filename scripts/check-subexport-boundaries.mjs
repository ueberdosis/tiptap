/**
 * Fails when one subexport reaches into another with a relative import.
 * Relative imports get bundled, so `extensions/table` importing
 * `../list/index.js` would ship a second copy of the list extension inside the
 * table entry. Cross a boundary through the published specifier
 * (`@tiptap/editor/extensions/list`) instead, which stays external.
 *
 * Allowed: relative imports within a subexport, and relative imports of shared
 * internal modules that are not themselves a subexport. Type-only imports are
 * erased at build time, so they are ignored.
 *
 * Usage: node scripts/check-subexport-boundaries.mjs
 */
import { readFileSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'
import fg from 'fast-glob'

const VALUE_IMPORT = /(?:import|export)\s+(?!type\s)[^'"]*?from\s*['"](\.[^'"]+)['"]/g

/** `./extensions/bold` -> `extensions/bold`; the root and jsx entries have no directory */
const subexportDirs = manifest =>
  Object.keys(manifest.exports ?? {})
    .filter(subpath => subpath !== '.' && !subpath.startsWith('./jsx-'))
    .map(subpath => subpath.slice(2))
    // longest first, so extensions/list/kit wins over extensions/list
    .sort((a, b) => b.length - a.length)

const ownerOf = (subpaths, path) =>
  subpaths.find(subpath => path === subpath || path.startsWith(`${subpath}/`))

const violations = []

for (const manifestPath of fg.sync('packages/*/package.json')) {
  const packageDir = dirname(manifestPath)
  const subpaths = subexportDirs(JSON.parse(readFileSync(manifestPath, 'utf8')))
  const sourceRoot = `${packageDir}/src`

  for (const file of fg.sync(`${sourceRoot}/**/*.{ts,tsx}`, { ignore: ['**/__tests__/**'] })) {
    const owner = ownerOf(subpaths, relative(sourceRoot, file))
    if (!owner) continue

    for (const [, specifier] of readFileSync(file, 'utf8').matchAll(VALUE_IMPORT)) {
      const target = relative(sourceRoot, resolve(dirname(file), specifier))
      const targetOwner = ownerOf(subpaths, target)

      if (targetOwner === undefined || targetOwner === owner) continue

      violations.push(
        `${file}\n    imports '${specifier}' from subexport ${targetOwner}/ (this file belongs to ${owner}/)`,
      )
    }
  }
}

if (violations.length === 0) {
  console.log('No subexport reaches into another with a relative import.')
  process.exit(0)
}

console.error(`Subexport boundary violations (${violations.length}):\n`)
for (const violation of violations) console.error(`  ${violation}\n`)
console.error('Import through the published specifier instead, so the code stays external.')
process.exit(1)
