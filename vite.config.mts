import fg from 'fast-glob'
import { resolve } from 'path'
import { defineConfig } from 'vite-plus'

const getPackageAliases = () => {
  const aliases: Record<string, string> = {}

  function collectPackageInformation(path: string) {
    fg.sync(`${path}/*`, { onlyDirectories: true })
      .map(name => name.replace(`${path}/`, ''))
      .forEach(name => {
        if (name === 'pm') {
          fg.sync(`${path}/${name}/*`, { onlyDirectories: true }).forEach(subName => {
            const subPkgName = subName.replace(`${path}/${name}/`, '')

            if (subPkgName === 'dist' || subPkgName === 'node_modules') {
              return
            }

            aliases[`@tiptap/${name}/${subPkgName}`] = resolve(
              `${path}/${name}/${subPkgName}/index.ts`,
            )
          })
        } else if (name === 'static-renderer') {
          // Handle static-renderer subpaths
          fg.sync(`${path}/${name}/src/*`, { onlyDirectories: true }).forEach(subName => {
            const subPkgName = subName.replace(`${path}/${name}/src/`, '')

            if (subPkgName === 'json' || subPkgName === 'pm') {
              fg.sync(`${path}/${name}/src/${subPkgName}/*`, { onlyDirectories: true }).forEach(
                subSubName => {
                  const subSubPkgName = subSubName.replace(`${path}/${name}/src/${subPkgName}/`, '')
                  aliases[`@tiptap/${name}/${subPkgName}/${subSubPkgName}`] = resolve(
                    `${path}/${name}/src/${subPkgName}/${subSubPkgName}/index.ts`,
                  )
                },
              )
            }
          })
          aliases[`@tiptap/${name}`] = resolve(`${path}/${name}/src/index.ts`)
        } else if (
          name === 'extension-text-style' ||
          name === 'extension-table' ||
          name === 'extensions' ||
          name === 'extension-list' ||
          name === 'react' ||
          name === 'vue'
        ) {
          fg.sync(`${path}/${name}/src/*`, { onlyDirectories: true }).forEach(subName => {
            const subPkgName = subName.replace(`${path}/${name}/src/`, '')

            aliases[`@tiptap/${name}/${subPkgName}`] = resolve(
              `${path}/${name}/src/${subPkgName}/index.ts`,
            )
          })
          aliases[`@tiptap/${name}`] = resolve(`${path}/${name}/src/index.ts`)
        } else {
          aliases[`@tiptap/${name}`] = resolve(`${path}/${name}/src/index.ts`)
        }
      })
  }

  collectPackageInformation('./packages')

  return aliases
}

export default defineConfig({
  fmt: {
    ignorePatterns: ['CHANGELOG.md'],
    semi: false,
    singleQuote: true,
    arrowParens: 'avoid',
  },
  lint: {
    jsPlugins: [{ name: 'vite-plus', specifier: 'vite-plus/oxlint-plugin' }],
    rules: { 'vite-plus/prefer-vite-plus-imports': 'error' },
    // Enable after the existing workspace type errors are resolved.
    // options: { typeAware: true, typeCheck: true },
  },
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

    return [`vp check --fix ${fileList}`]
  },
  resolve: {
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
  oxc: {
    jsx: {
      runtime: 'automatic',
      importSource: 'react',
    },
  },
})
