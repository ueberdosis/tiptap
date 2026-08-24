/**
 * Rewrites import and export statements when a package moves to a new subpath.
 *
 * Handles default imports (the moved subexports drop their default export, so
 * `import Bold from …` becomes `import { Bold } from …`), named clauses split
 * across several new subpaths, type-only clauses, and `as` aliases.
 *
 * Usage: node scripts/rewriteImports.mjs <config.json>
 *
 * Config maps each old specifier to where its symbols now live:
 *   {
 *     "@tiptap/extension-bold": {
 *       "defaultExport": "Bold",
 *       "fallback": "@tiptap/editor/extensions/bold"
 *     },
 *     "@tiptap/extension-text-style": {
 *       "symbols": { "Color": "@tiptap/editor/extensions/color" }
 *     }
 *   }
 *
 * `fallback` catches every named symbol not listed in `symbols`, which keeps
 * one-to-one moves from having to enumerate every option and helper type.
 */
import { execFileSync } from 'node:child_process'
import { lstatSync, readFileSync, writeFileSync } from 'node:fs'

const config = JSON.parse(readFileSync(process.argv[2], 'utf8'))

const STATEMENT = new RegExp(
  String.raw`(?<kind>import|export)\s+(?<typeOnly>type\s+)?(?<clause>[^;'"]*?)\s*from\s*'(?<specifier>[^']+)';?`,
  'g',
)

/** `Bold, { type BoldOptions as Opts }` -> default name plus named specifiers */
const parseClause = clause => {
  const braces = clause.match(/\{([\s\S]*)\}/)
  const named = braces
    ? braces[1]
        .split(',')
        .map(part => part.trim())
        .filter(Boolean)
    : []
  const defaultName = clause.replace(/\{[\s\S]*\}/, '').replace(/,/g, '').trim()

  return { defaultName, named }
}

const homeFor = (rule, name) => {
  const home = rule.symbols?.[name] ?? rule.fallback
  if (!home) throw new Error(`no target for symbol "${name}"`)
  return home
}

/** `type Foo as Bar` -> the imported name, ignoring the local alias */
const importedName = specifier => specifier.replace(/^type\s+/, '').split(/\s+as\s+/)[0].trim()

const rewriteStatement = (match, groups) => {
  const rule = config[groups.specifier]
  if (!rule) return match

  const { defaultName, named } = parseClause(groups.clause)
  if (groups.clause.includes('*')) {
    throw new Error(`namespace import needs manual review: ${match}`)
  }

  const byHome = new Map()
  const add = (home, specifier) => {
    if (!byHome.has(home)) byHome.set(home, [])
    byHome.get(home).push(specifier)
  }

  // the subexports export names only, so a default import becomes a named one
  if (defaultName) {
    const canonical = rule.defaultExport
    if (!canonical) throw new Error(`${groups.specifier} has no defaultExport mapping`)
    add(
      homeFor(rule, canonical),
      canonical === defaultName ? canonical : `${canonical} as ${defaultName}`,
    )
  }

  for (const specifier of named) {
    add(homeFor(rule, importedName(specifier)), specifier)
  }

  const prefix = groups.typeOnly ? `${groups.kind} type ` : `${groups.kind} `

  return [...byHome.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([home, specifiers]) => `${prefix}{ ${[...new Set(specifiers)].sort().join(', ')} } from '${home}'`)
    .join('\n')
}

const files = execFileSync('git', ['ls-files'], { encoding: 'utf8' })
  .split('\n')
  .filter(file => file && !file.endsWith('CHANGELOG.md') && file !== 'pnpm-lock.yaml')
  .filter(file => {
    try {
      return lstatSync(file).isFile() && !lstatSync(file).isSymbolicLink()
    } catch {
      return false
    }
  })

let changed = 0

for (const file of files) {
  let text
  try {
    text = readFileSync(file, 'utf8')
  } catch {
    continue
  }
  if (!Object.keys(config).some(specifier => text.includes(`'${specifier}'`))) continue

  const next = text.replace(STATEMENT, (...args) => {
    const groups = args.at(-1)
    try {
      return rewriteStatement(args[0], groups)
    } catch (error) {
      throw new Error(`${file}: ${error.message}`)
    }
  })

  if (next !== text) {
    writeFileSync(file, next)
    changed += 1
  }
}

console.log(`rewrote ${changed} files`)
