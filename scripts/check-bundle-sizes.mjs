/**
 * Bundles every published subpath on its own and compares the result against a
 * committed baseline. Guards the tree-shaking promise: if `extensions/bold`
 * suddenly pulls in the whole editor, the number moves and CI fails.
 *
 * Only Tiptap code counts. Peer dependencies stay external, so the number
 * answers "how much of our code does this subpath cost".
 *
 * Resolves through each package's `exports` map, so run it after a build or it
 * measures stale output.
 *
 * Usage:
 *   node scripts/check-bundle-sizes.mjs            compare against the baseline
 *   node scripts/check-bundle-sizes.mjs --update   rewrite the baseline
 */
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import fg from 'fast-glob'

const BASELINE = 'scripts/bundle-sizes.json'
const TOLERANCE = 0.1
const update = process.argv.includes('--update')

const specifiers = fg
  .sync('packages/*/package.json')
  .flatMap(manifestPath => {
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
    return Object.keys(manifest.exports ?? {}).map(subpath =>
      subpath === '.' ? manifest.name : `${manifest.name}/${subpath.slice(2)}`,
    )
  })
  .sort()

// inside the repo, so bare `@tiptap/*` specifiers resolve through node_modules
const workDir = 'node_modules/.bundle-size-check'
mkdirSync(workDir, { recursive: true })
const sizes = {}
const failures = new Map()

try {
  for (const specifier of specifiers) {
    const entry = join(workDir, 'entry.js')
    writeFileSync(entry, `import * as everything from '${specifier}'\nconsole.log(everything)\n`)

    try {
      const output = execFileSync(
        'node_modules/.bin/esbuild',
        [
          entry,
          '--bundle',
          '--minify',
          '--format=esm',
          '--platform=browser',
          '--log-level=silent',
          // our own code is the thing being measured; everything else is a peer
          '--external:react',
          '--external:react-dom',
          '--external:vue',
          '--external:yjs',
          '--external:@tiptap/y-tiptap',
          '--external:happy-dom',
        ],
        { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 },
      )
      sizes[specifier] = Buffer.byteLength(output)
    } catch (error) {
      sizes[specifier] = null
      failures.set(specifier, String(error.stderr || error.message).trim().split('\n')[0])
    }
  }
} finally {
  rmSync(workDir, { recursive: true, force: true })
}

if (update || !existsSync(BASELINE)) {
  writeFileSync(BASELINE, `${JSON.stringify(sizes, null, 2)}\n`)
  console.log(`Wrote ${Object.keys(sizes).length} entries to ${BASELINE}`)
  process.exit(0)
}

const baseline = JSON.parse(readFileSync(BASELINE, 'utf8'))
const problems = []

for (const [specifier, size] of Object.entries(sizes)) {
  const before = baseline[specifier]

  if (before === undefined) {
    problems.push(`${specifier}: new subpath (${size} B). Run with --update.`)
    continue
  }
  if (size === null) {
    problems.push(`${specifier}: failed to bundle - ${failures.get(specifier) ?? 'unknown'}`)
    continue
  }
  if (before !== null && size > before * (1 + TOLERANCE)) {
    const growth = Math.round((size / before - 1) * 100)
    problems.push(`${specifier}: ${before} B -> ${size} B (+${growth}%)`)
  }
}

for (const specifier of Object.keys(baseline)) {
  if (!(specifier in sizes)) problems.push(`${specifier}: gone from exports. Run with --update.`)
}

if (problems.length === 0) {
  console.log(`All ${Object.keys(sizes).length} subpaths within ${TOLERANCE * 100}% of baseline.`)
  process.exit(0)
}

console.error(`Bundle size problems (${problems.length}):\n`)
for (const problem of problems) console.error(`  ${problem}`)
console.error('\nIf the growth is intended, rerun with --update and commit the baseline.')
process.exit(1)
