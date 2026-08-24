import fg from 'fast-glob'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

const WORKSPACE_GLOBS = ['packages/*/package.json', 'packages-deprecated/*/package.json']

/** `./pm/model` -> `src/pm/model/index.ts`, `.` -> `src/index.ts` */
const sourceFor = (subpath: string) => {
  if (subpath === '.') return 'src/index.ts'

  // jsx-runtime and jsx-dev-runtime are one module, not a directory
  if (subpath.startsWith('./jsx-')) return 'src/jsx-runtime.ts'

  return `src/${subpath.slice(2)}/index.ts`
}

/**
 * Build Vite aliases that point every published subpath at its source file.
 *
 * Derived from each package's `exports` map so dev and test resolution cannot
 * drift from what actually ships. Longest specifier first, because a bare
 * `@tiptap/editor` would otherwise shadow `@tiptap/editor/pm/state`.
 *
 * @param root Directory the globs resolve against, relative to the caller.
 * @example
 * // vite.config.mts at the repo root
 * resolve: { alias: packageAliases('.') }
 */
export const packageAliases = (root: string) => {
  const aliases: Array<{ find: RegExp; replacement: string }> = []

  for (const manifestPath of fg.sync(WORKSPACE_GLOBS, { cwd: resolve(root), absolute: true })) {
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
    if (!manifest.name) continue

    const packageDir = dirname(manifestPath)

    for (const subpath of Object.keys(manifest.exports ?? { '.': manifest.module })) {
      const specifier = subpath === '.' ? manifest.name : `${manifest.name}/${subpath.slice(2)}`

      aliases.push({
        find: new RegExp(`^${specifier.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`),
        replacement: resolve(packageDir, sourceFor(subpath)),
      })
    }
  }

  return aliases.sort((a, b) => b.find.source.length - a.find.source.length)
}
