import { defineConfig } from 'vite-plus'

import { packageAliases } from './packageAliases.mjs'

export default defineConfig({
  run: {
    // Cache package.json scripts (build, lint, test, ...). Persistent
    // scripts like `dev` never exit, so they are never cached.
    cache: { scripts: true, tasks: true },
  },
  test: {
    environment: 'happy-dom',
    include: ['packages/**/*.test.ts', 'packages/**/*.spec.ts'],
    exclude: ['demos/**', 'tests/**', '**/node_modules/**'],
    pool: 'forks',
  },
  staged: files => {
    const filteredFiles = files.filter(file => /\.(ts|tsx|js|jsx|vue)$/.test(file))

    if (filteredFiles.length === 0) {
      return []
    }

    const fileList = filteredFiles.join(' ')

    return [`oxfmt ${fileList}`, `oxlint --fix --quiet --no-error-on-unmatched-pattern ${fileList}`]
  },
  resolve: {
    alias: packageAliases('.'),
  },
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'react',
  },
})
