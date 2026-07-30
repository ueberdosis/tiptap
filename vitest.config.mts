import { svelte } from '@sveltejs/vite-plugin-svelte'
import fg from 'fast-glob'
import { resolve } from 'path'
import { defineConfig } from 'vitest/config'

const PACKAGE_ROOTS = ['./packages', './packages-deprecated']

// Packages that expose every folder in src as its own subpath.
const SRC_SUBPATH_PACKAGES = [
  'extension-text-style',
  'extension-table',
  'extensions',
  'extension-list',
  'react',
  'vue-2',
  'vue-3',
]

const STATIC_RENDERER_SUBPATHS = ['json', 'pm']

const subDirNames = (path: string) =>
  fg.sync(`${path}/*`, { onlyDirectories: true }).map(dir => dir.replace(`${path}/`, ''))

// pm re-exports one ProseMirror package per folder, with no src directory.
const pmAliases = (path: string) =>
  Object.fromEntries(
    subDirNames(`${path}/pm`)
      .filter(name => name !== 'dist' && name !== 'node_modules')
      .map(name => [`@tiptap/pm/${name}`, resolve(`${path}/pm/${name}/index.ts`)]),
  )

// static-renderer nests one level deeper, under src/json and src/pm.
const staticRendererAliases = (path: string) => {
  const root = `${path}/static-renderer/src`

  const nested = subDirNames(root)
    .filter(name => STATIC_RENDERER_SUBPATHS.includes(name))
    .flatMap(name =>
      subDirNames(`${root}/${name}`).map(subName => [
        `@tiptap/static-renderer/${name}/${subName}`,
        resolve(`${root}/${name}/${subName}/index.ts`),
      ]),
    )

  return {
    ...Object.fromEntries(nested),
    '@tiptap/static-renderer': resolve(`${root}/index.ts`),
  }
}

const srcSubpathAliases = (path: string, name: string) => {
  const root = `${path}/${name}/src`

  const subpaths = subDirNames(root).map(subName => [
    `@tiptap/${name}/${subName}`,
    resolve(`${root}/${subName}/index.ts`),
  ])

  return {
    ...Object.fromEntries(subpaths),
    [`@tiptap/${name}`]: resolve(`${root}/index.ts`),
  }
}

const packageAliases = (path: string, name: string): Record<string, string> => {
  if (name === 'pm') {
    return pmAliases(path)
  }

  if (name === 'static-renderer') {
    return staticRendererAliases(path)
  }

  if (SRC_SUBPATH_PACKAGES.includes(name)) {
    return srcSubpathAliases(path, name)
  }

  return { [`@tiptap/${name}`]: resolve(`${path}/${name}/src/index.ts`) }
}

const getPackageAliases = () => {
  const aliases: Record<string, string> = {}

  for (const path of PACKAGE_ROOTS) {
    for (const name of subDirNames(path)) {
      Object.assign(aliases, packageAliases(path, name))
    }
  }

  return aliases
}

export default defineConfig({
  plugins: [svelte()],
  test: {
    environment: 'happy-dom',
    include: ['packages/**/*.test.ts', 'packages/**/*.spec.ts'],
    exclude: ['demos/**', 'tests/**', '**/node_modules/**'],
    pool: 'forks',
  },
  ssr: {
    // Svelte components in this repo are only compiled when the testing library
    // is bundled rather than externalized.
    noExternal: ['@testing-library/svelte'],
  },
  resolve: {
    // Svelte must resolve to its browser build, otherwise tests get the SSR
    // code, which cannot mount components.
    conditions: ['browser'],
    alias: [
      {
        find: /^@tiptap\/core\/jsx-dev-runtime$/,
        replacement: resolve('./packages/core/src/jsx-runtime.ts'),
      },
      {
        find: /^@tiptap\/core\/jsx-runtime$/,
        replacement: resolve('./packages/core/src/jsx-runtime.ts'),
      },
      ...Object.entries(getPackageAliases()).map(([find, replacement]) => ({
        find,
        replacement,
      })),
    ],
  },
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'react',
  },
})
