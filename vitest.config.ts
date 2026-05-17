import fg from 'fast-glob'
import { resolve } from 'path'
import { defineConfig } from 'vitest/config'

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

            aliases[`@tiptap/${name}/${subPkgName}`] = resolve(`${path}/${name}/${subPkgName}/index.ts`)
          })
        } else if (name === 'static-renderer') {
          // Handle static-renderer subpaths
          fg.sync(`${path}/${name}/src/*`, { onlyDirectories: true }).forEach(subName => {
            const subPkgName = subName.replace(`${path}/${name}/src/`, '')

            if (subPkgName === 'json' || subPkgName === 'pm') {
              fg.sync(`${path}/${name}/src/${subPkgName}/*`, { onlyDirectories: true }).forEach(subSubName => {
                const subSubPkgName = subSubName.replace(`${path}/${name}/src/${subPkgName}/`, '')
                aliases[`@tiptap/${name}/${subPkgName}/${subSubPkgName}`] = resolve(
                  `${path}/${name}/src/${subPkgName}/${subSubPkgName}/index.ts`,
                )
              })
            }
          })
          aliases[`@tiptap/${name}`] = resolve(`${path}/${name}/src/index.ts`)
        } else if (
          name === 'extension-text-style' ||
          name === 'extension-table' ||
          name === 'extensions' ||
          name === 'extension-list' ||
          name === 'react' ||
          name === 'vue-2' ||
          name === 'vue-3'
        ) {
          fg.sync(`${path}/${name}/src/*`, { onlyDirectories: true }).forEach(subName => {
            const subPkgName = subName.replace(`${path}/${name}/src/`, '')

            aliases[`@tiptap/${name}/${subPkgName}`] = resolve(`${path}/${name}/src/${subPkgName}/index.ts`)
          })
          aliases[`@tiptap/${name}`] = resolve(`${path}/${name}/src/index.ts`)
        } else if (name === 'editor') {
          // @tiptap/editor uses FLAT leaf files for most subpaths
          // (src/nodes/heading.ts → @tiptap/editor/nodes/heading) but also
          // supports nested directories with index.ts for modules that need
          // helper files (src/marks/link/, src/extensions/list-keymap/,
          // src/nodes/ordered-list/).
          fg.sync(`${path}/${name}/src/*`, { onlyDirectories: true }).forEach(subDir => {
            const subDirName = subDir.replace(`${path}/${name}/src/`, '')

            if (subDirName === 'react' || subDirName === '__tests__') {
              if (subDirName === 'react') {
                aliases[`@tiptap/${name}/${subDirName}`] = resolve(`${path}/${name}/src/${subDirName}/index.ts`)
              }
              return
            }

            // Flat .ts/.tsx leaves in this subDir.
            fg.sync(`${subDir}/*.{ts,tsx}`).forEach(leafPath => {
              const leafName = leafPath.replace(`${subDir}/`, '').replace(/\.tsx?$/, '')
              aliases[`@tiptap/${name}/${subDirName}/${leafName}`] = resolve(leafPath)
            })

            // Nested directories with their own index.ts.
            fg.sync(`${subDir}/*`, { onlyDirectories: true }).forEach(nestedDir => {
              const nestedName = nestedDir.replace(`${subDir}/`, '')
              aliases[`@tiptap/${name}/${subDirName}/${nestedName}`] = resolve(`${nestedDir}/index.ts`)
            })
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
  test: {
    environment: 'happy-dom',
    include: ['packages/**/*.test.ts', 'packages/**/*.spec.ts'],
    exclude: ['demos/**', 'tests/**', '**/node_modules/**'],
    pool: 'forks',
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
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: '@tiptap/core',
  },
})
