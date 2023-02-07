import sizes from '@atomico/rollup-plugin-sizes'
import babel from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import fs from 'fs'
import path from 'path'
import autoExternal from 'rollup-plugin-auto-external'
import sourcemaps from 'rollup-plugin-sourcemaps'
import typescript from 'rollup-plugin-typescript2'

const pkgs = [
  'core',
  'extension-blockquote',
  'extension-bold',
  'extension-bubble-menu',
  'extension-bullet-list',
  'extension-code',
  'extension-code-block',
  'extension-code-block-lowlight',
  'extension-collaboration',
  'extension-collaboration-cursor',
  'extension-color',
  'extension-document',
  'extension-dropcursor',
  'extension-floating-menu',
  'extension-focus',
  'extension-font-family',
  'extension-gapcursor',
  'extension-hard-break',
  'extension-heading',
  'extension-highlight',
  'extension-history',
  'extension-horizontal-rule',
  'extension-image',
  'extension-italic',
  'extension-link',
  'extension-list-item',
  'extension-mention',
  'extension-ordered-list',
  'extension-paragraph',
  'extension-placeholder',
  'extension-strike',
  'extension-subscript',
  'extension-table',
  'extension-table-cell',
  'extension-table-header',
  'extension-table-row',
  'extension-task-item',
  'extension-task-list',
  'extension-text',
  'extension-text-align',
  'extension-text-style',
  'extension-typography',
  'extension-underline',
  'extension-youtube',
  'html',
  'react',
  'starter-kit',
  'suggestion',
  'vue-2',
  'vue-3',
]

async function build() {
  const config = []

  pkgs.forEach(currentPackage => {
    const pkg = require(`./packages/${currentPackage}/package.json`)

    const basePath = path.relative(__dirname, `./packages/${currentPackage}`)
    const input = path.join(basePath, 'src/index.ts')

    const {
      name,
      main,
      umd,
      module,
    } = pkg

    const basePlugins = [
      sourcemaps(),
      resolve(),
      commonjs(),
      babel({
        babelHelpers: 'bundled',
        exclude: 'node_modules/**',
      }),
      sizes(),
    ]

    config.push({
      // perf: true,
      input,
      output: [
        {
          name,
          file: path.join(basePath, umd),
          format: 'umd',
          sourcemap: true,
        },
        {
          name,
          file: path.join(basePath, main),
          format: 'cjs',
          sourcemap: true,
          exports: 'auto',
        },
        {
          name,
          file: path.join(basePath, module),
          format: 'es',
          sourcemap: true,
        },
      ],
      plugins: [
        autoExternal({
          packagePath: path.join(basePath, 'package.json'),
        }),
        ...basePlugins,
        typescript({
          tsconfig: fs.existsSync(`${basePath}/tsconfig.json`)
            ? `${basePath}/tsconfig.json`
            : 'tsconfig.json',
          tsconfigOverride: {
            compilerOptions: {
              declaration: true,
              paths: {
                '@tiptap/*': ['packages/*/src'],
              },
            },
            include: fs.existsSync(`${basePath}/tsconfig.json`)
              ? []
              : null,
          },
        }),
      ],
    })
  })

  return config
}

export default build
