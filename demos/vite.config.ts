// @ts-nocheck
import {
  resolve,
  basename,
  dirname,
  join,
} from 'path'
import { v4 as uuid } from 'uuid'
import fs from 'fs'
import globby from 'globby'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import reactRefresh from '@vitejs/plugin-react-refresh'

export default defineConfig({
  optimizeDeps: {
    include: [
      'prosemirror-commands',
      'prosemirror-inputrules',
      'prosemirror-keymap',
      'prosemirror-model',
      'prosemirror-schema-list',
      'prosemirror-state',
      'prosemirror-transform',
      'prosemirror-view',
      'prosemirror-history',
      'prosemirror-dropcursor',
      'prosemirror-gapcursor',
      'prosemirror-tables',
      'tippy.js',
      'yjs',
      'y-prosemirror',
      'y-websocket',
      'y-indexeddb',
      'y-webrtc',
    ],
  },

  build: {
    rollupOptions: {
      input: globby.sync('./**/index.html', {
        ignore: ['dist'],
      }),
    },
  },

  plugins: [
    vue(),
    reactRefresh(),

    {
      name: 'raw',
      resolveId(id, importer) {
        if (id.startsWith('raw!')) {
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
          const demos = globby
            .sync('./src/*/*', { onlyDirectories: true })
            .map(demoPath => {
              const name = demoPath.replace('./src/', '')
              const tabs = globby
                .sync(`./src/${name}/*`, { onlyDirectories: true })
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
        if (id === '@source') {
          return `source!${dirname(importer)}!!${uuid()}`
        }
      },
      load(id) {
        if (id.startsWith('source!')) {
          const path = id.split('!!')[0].replace('source!', '')
          const files = globby
            .sync(`${path}/**/*`, {
              ignore: [
                '**/index.html',
                '**/*.spec.js',
                '**/*.spec.ts',
              ],
            })
            .map(filePath => {
              const name = filePath.replace(`${path}/`, '')

              return {
                name,
                content: fs.readFileSync(`${path}/${name}`, 'utf8'),
              }
            })

          const sortedFiles = files.sort(item => {
            if (
              item.name.split('/').length === 0
              && basename(item.name).startsWith('index.')
            ) {
              return -1
            }

            return 1
          })

          return `export default ${JSON.stringify(sortedFiles)}`
        }
      },
    },

    {
      name: 'middleware',
      apply: 'serve',
      configureServer(viteDevServer) {
        return () => {
          viteDevServer.middlewares.use(async (req, res, next) => {
            if (req.originalUrl.startsWith('/preview')) {
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
      ...globby.sync('../packages/*', { onlyDirectories: true })
        .map(name => name.replace('../packages/', ''))
        .map(name => {
          return { find: `@tiptap/${name}`, replacement: resolve(`../packages/${name}/src/index.ts`) }
        }),
    ],
  },

  // server: {
  //   fs: {
  //     // Allow serving files from one level up to the project root
  //     allow: ['..']
  //   }
  // }
})
