import { svelte } from '@sveltejs/vite-plugin-svelte'
import react from '@vitejs/plugin-react'
import vue from '@vitejs/plugin-vue'
import fg from 'fast-glob'
import fs from 'fs'
import { basename, dirname, join, resolve } from 'path'
import { v4 as uuid } from 'uuid'
import { defineConfig } from 'vite'

const getPackageDependencies = () => {
  const paths: Array<{ find: string; replacement: any }> = []

  function collectPackageInformation(path: string) {
    fg.sync(`../${path}/*`, { onlyDirectories: true })
      .map(name => name.replace(`../${path}/`, ''))
      .forEach(name => {
        if (name === 'pm') {
          fg.sync(`../${path}/${name}/*`, { onlyDirectories: true }).forEach(subName => {
            const subPkgName = subName.replace(`../${path}/${name}/`, '')

            if (subPkgName === 'dist' || subPkgName === 'node_modules') {
              return
            }

            paths.push({
              find: `@tiptap/${name}/${subPkgName}`,
              replacement: resolve(`../${path}/${name}/${subPkgName}/index.ts`),
            })
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
          fg.sync(`../${path}/${name}/src/*`, { onlyDirectories: true }).forEach(subName => {
            const subPkgName = subName.replace(`../${path}/${name}/src/`, '')

            paths.push({
              find: `@tiptap/${name}/${subPkgName}`,
              replacement: resolve(`../${path}/${name}/src/${subPkgName}/index.ts`),
            })
          })
          paths.push({ find: `@tiptap/${name}`, replacement: resolve(`../${path}/${name}/src/index.ts`) })
        } else {
          paths.push({ find: `@tiptap/${name}`, replacement: resolve(`../${path}/${name}/src/index.ts`) })
        }
      })
  }

  collectPackageInformation('packages')
  collectPackageInformation('packages-deprecated')

  // Handle the JSX runtime alias
  paths.unshift({ find: '@tiptap/core/jsx-runtime', replacement: resolve('../packages/core/src/jsx-runtime.ts') })
  paths.unshift({ find: '@tiptap/core/jsx-dev-runtime', replacement: resolve('../packages/core/src/jsx-runtime.ts') })

  return paths
}

const dedupeDeps = fs
  .readFileSync('./dedupeDeps.txt')
  .toString()
  .replace(/\r\n/g, '\n')
  .split('\n')
  .filter(value => value)

export default defineConfig({
  server: {
    port: 3000,
  },
  preview: {
    port: 3000,
  },

  build: {
    rollupOptions: {
      input: fg.sync('./**/index.html', {
        ignore: ['dist', 'node_modules'],
      }),
    },
  },

  worker: {
    format: 'es',
  },

  plugins: [
    // checker({ typescript: { tsconfigPath: './tsconfig.base.json' } }),
    // checker({ typescript: { tsconfigPath: './tsconfig.react.json' } }),
    // checker({ typescript: { tsconfigPath: './tsconfig.vue-2.json' } }),
    // checker({ typescript: { tsconfigPath: './tsconfig.vue-3.json' } }),
    // @ts-ignore
    vue(),
    // @ts-ignore
    react(),
    // @ts-ignore
    svelte(),

    {
      name: 'html-transform',
      transformIndexHtml: {
        enforce: 'pre',
        transform(html: string, context) {
          const dir = dirname(context.path)
          const data = dir.split('/')

          const demoCategory = data[2]
          const demoName = data[3]
          const frameworkName = data[4]

          if (dir.endsWith('/JS') || dir.endsWith('-JS')) {
            return {
              html: `
                <!DOCTYPE html>
                <html lang="en">
                  <head>
                    <meta charset="utf-8"/>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
                  </head>
                  <body>
                    ${html}
                    <script type="module">
                      import setup from '../../../../setup/js.ts'
                      import source from '@source'
                      setup('${demoCategory}/${demoName}/${frameworkName}', source)
                    </script>
                  </body>
                </html>
              `,
              tags: [],
            }
          }

          if (dir.endsWith('/Vue') || dir.endsWith('-Vue')) {
            return {
              html: `
                <!DOCTYPE html>
                <html lang="en">
                  <head>
                    <meta charset="utf-8"/>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
                  </head>
                  <body>
                    <div id="app"></div>
                    <script type="module">
                      import setup from '../../../../setup/vue.ts'
                      import source from '@source'
                      setup('${demoCategory}/${demoName}/${frameworkName}', source)
                    </script>
                  </body>
                </html>
              `,
              tags: [],
            }
          }

          if (dir.endsWith('/Svelte') || dir.endsWith('-Svelte')) {
            return {
              html: `
                <!DOCTYPE html>
                <html lang="en">
                  <head>
                    <meta charset="utf-8"/>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
                  </head>
                  <body>
                    <div id="app"></div>
                    <script type="module">
                      import setup from '../../../../setup/svelte.ts'
                      import source from '@source'
                      setup('${demoCategory}/${demoName}/${frameworkName}', source)
                    </script>
                  </body>
                </html>
              `,
              tags: [],
            }
          }

          if (dir.endsWith('/React') || dir.endsWith('-React')) {
            return {
              html: `
                <!DOCTYPE html>
                <html lang="en">
                  <head>
                    <meta charset="utf-8"/>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
                  </head>
                  <body>
                    <div id="app"></div>
                    <script type="module">
                      import setup from '../../../../setup/react.ts'
                      import source from '@source'
                      setup('${demoCategory}/${demoName}/${frameworkName}', source)
                    </script>
                  </body>
                </html>
              `,
              tags: [],
            }
          }
        },
      },
    },

    {
      name: 'raw',
      resolveId(id, importer) {
        if (id.startsWith('raw!') && importer) {
          const [, relativePath] = id.split('raw!')
          const fullPath = join(dirname(importer), relativePath)

          return `virtual!${fullPath}!!${uuid()}`
        }
      },
      load(id) {
        if (id.startsWith('virtual!')) {
          const path = id.split('!!')[0].replace('virtual!', '')
          const data = fs.readFileSync(path, 'utf8')

          return `export default ${JSON.stringify(data)}`
        }
      },
    },

    {
      name: 'demos',
      resolveId(id) {
        if (id === '@demos') {
          return '@demos'
        }
      },
      load(id) {
        if (id === '@demos') {
          const demos = fg.sync('./src/*/*', { onlyDirectories: true }).map(demoPath => {
            const name = demoPath.replace('./src/', '')
            const tabs = fg.sync(`./src/${name}/*`, { onlyDirectories: true }).map(tabPath => ({
              name: basename(tabPath),
            }))

            return {
              name,
              tabs,
            }
          })

          return `export const demos = ${JSON.stringify(demos)}`
        }
      },
    },

    {
      name: 'source',
      resolveId(id, importer) {
        if (id === '@source' && importer) {
          return `source!${dirname(importer)}!!${uuid()}`
        }
      },
      load(id) {
        if (id.startsWith('source!')) {
          const path = id.split('!!')[0].replace('source!', '')
          const ignore = ['**/*.spec.js', '**/*.spec.ts', 'node_modules/**']

          if (!path.endsWith('/JS')) {
            ignore.push('**/index.html')
          }

          const files = fg
            .sync(`${path}/**/*`, { ignore })
            .map(filePath => {
              const name = filePath.replace(`${path}/`, '')

              return {
                name,
                content: fs.readFileSync(`${path}/${name}`, 'utf8'),
              }
            })
            .sort((a, b) => {
              const depthA = a.name.split('/').length
              const depthB = b.name.split('/').length

              if (depthA > depthB) {
                return 1
              }

              if (depthA < depthB) {
                return -1
              }

              const aIsIndex = basename(a.name).includes('index.')
              const bIsIndex = basename(b.name).includes('index.')

              if (aIsIndex) {
                return -1
              }

              if (bIsIndex) {
                return 1
              }

              return 0
            })

          return `export default ${JSON.stringify(files)}`
        }
      },
    },

    {
      name: 'middleware',
      apply: 'serve',
      configureServer(viteDevServer) {
        return () => {
          viteDevServer.middlewares.use(async (req, res, next) => {
            if (req?.originalUrl?.startsWith('/preview')) {
              req.url = '/preview/index.html'
            }

            next()
          })
        }
      },
    },
  ],

  resolve: {
    alias: getPackageDependencies(),
    dedupe: dedupeDeps,
  },
})
