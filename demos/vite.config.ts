import {
  resolve,
  basename,
  dirname,
  join,
} from 'path'
import { v4 as uuid } from 'uuid'
import fs from 'fs'
import fg from 'fast-glob'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import reactRefresh from '@vitejs/plugin-react-refresh'
// import checker from 'vite-plugin-checker'

const includeDependencies = fs.readFileSync('./includeDependencies.txt')
  .toString()
  .replace(/\r\n/g, '\n')
  .split('\n')
  .filter(value => value)

export default defineConfig({
  optimizeDeps: {
    include: includeDependencies,
  },

  build: {
    rollupOptions: {
      input: fg.sync('./**/index.html', {
        ignore: ['dist'],
      }),
    },
  },

  plugins: [
    // checker({ typescript: { tsconfigPath: './tsconfig.base.json' } }),
    // checker({ typescript: { tsconfigPath: './tsconfig.react.json' } }),
    // checker({ typescript: { tsconfigPath: './tsconfig.vue-2.json' } }),
    // checker({ typescript: { tsconfigPath: './tsconfig.vue-3.json' } }),
    vue(),
    reactRefresh(),

    {
      name: 'html-transform',
      transformIndexHtml: {
        enforce: 'pre',
        transform(html: string, context) {
          const dir = dirname(context.path)
          const data = dir.split('/')
          const demoCategory = data[2]
          const demoName = data[3]

          if (dir.endsWith('/JS')) {
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
                      setup('${demoCategory}/${demoName}', source)
                    </script>
                  </body>
                </html>
              `,
              tags: [],
            }
          }

          if (dir.endsWith('/Vue')) {
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
                      setup('${demoCategory}/${demoName}', source)
                    </script>
                  </body>
                </html>
              `,
              tags: [],
            }
          }

          if (dir.endsWith('/React')) {
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
                      setup('${demoCategory}/${demoName}', source)
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
          const demos = fg.sync('./src/*/*', { onlyDirectories: true })
            .map(demoPath => {
              const name = demoPath.replace('./src/', '')
              const tabs = fg.sync(`./src/${name}/*`, { onlyDirectories: true })
                .map(tabPath => ({
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
          const ignore = [
            '**/*.spec.js',
            '**/*.spec.ts',
          ]

          if (!path.endsWith('/JS')) {
            ignore.push('**/index.html')
          }

          const files = fg.sync(`${path}/**/*`, { ignore })
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
    alias: [
      ...fg.sync('../packages/*', { onlyDirectories: true })
        .map(name => name.replace('../packages/', ''))
        .map(name => {
          return { find: `@tiptap/${name}`, replacement: resolve(`../packages/${name}/src/index.ts`) }
        }),
    ],
  },
})
