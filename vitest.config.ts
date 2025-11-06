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

            aliases[`@tiptap/${name}/${subPkgName}`] = resolve(`${path}/${name}/${subPkgName}/src/index.ts`)
          })
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
        } else {
          aliases[`@tiptap/${name}`] = resolve(`${path}/${name}/src/index.ts`)
        }
      })
  }

  collectPackageInformation('./packages')
  collectPackageInformation('./packages-deprecated')

  // Handle the JSX runtime alias
  aliases['@tiptap/core/jsx-runtime'] = resolve('./packages/core/src/jsx-runtime.ts')
  aliases['@tiptap/core/jsx-dev-runtime'] = resolve('./packages/core/src/jsx-runtime.ts')

  return aliases
}

export default defineConfig({
  test: {
    environment: 'node',
    include: ['packages/**/*.test.ts'],
    exclude: ['demos/**', 'tests/**', '**/node_modules/**'],
    globals: true,
  },
  resolve: {
    alias: getPackageAliases(),
  },
})
