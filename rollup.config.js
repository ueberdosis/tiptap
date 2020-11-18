import path from 'path'
import minimist from 'minimist'
import { getPackages } from '@lerna/project'
import filterPackages from '@lerna/filter-packages'
import batchPackages from '@lerna/batch-packages'
import sourcemaps from 'rollup-plugin-sourcemaps'
import typescript from 'rollup-plugin-typescript2'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import vuePlugin from 'rollup-plugin-vue'
import babel from '@rollup/plugin-babel'
import { terser } from 'rollup-plugin-terser'
import sizes from '@atomico/rollup-plugin-sizes'
import autoExternal from 'rollup-plugin-auto-external'

async function getSortedPackages(scope, ignore) {
  const packages = await getPackages(__dirname)
  const filtered = filterPackages(packages, scope, ignore, false)

  return batchPackages(filtered)
    .filter(item => item.name !== '@tiptap/docs')
    .reduce((arr, batch) => arr.concat(batch), [])
}

async function build(commandLineArgs) {
  const config = []

  // Support --scope and --ignore globs if passed in via commandline
  const { scope, ignore, ci } = minimist(process.argv.slice(2))
  const packages = await getSortedPackages(scope, ignore)

  // prevent rollup warning
  delete commandLineArgs.ci
  delete commandLineArgs.scope
  delete commandLineArgs.ignore

  packages.forEach(pkg => {
    const basePath = path.relative(__dirname, pkg.location)
    const input = path.join(basePath, 'src/index.ts')
    const {
      name,
      main,
      umd,
      module,
      unpkg,
    } = pkg.toJSON()

    const basePlugins = [
      sourcemaps(),
      resolve(),
      commonjs(),
      vuePlugin(),
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
          tsconfigOverride: {
            compilerOptions: {
              declaration: true,
              paths: {
                '@tiptap/*': ['packages/*/src'],
              },
            },
            include: null,
          },
        }),
      ],
    })

    if (!ci) {
      config.push({
        input,
        output: [
          {
            name,
            file: path.join(basePath, unpkg),
            format: 'umd',
            sourcemap: true,
            globals: {
              '@tiptap/core': '@tiptap/core',
              vue: 'Vue',
            },
          },
        ],
        external: [
          '@tiptap/core',
          'vue',
        ],
        plugins: [
          ...basePlugins,
          typescript({
            tsconfigOverride: {
              compilerOptions: {
                paths: {
                  '@tiptap/*': ['packages/*/src'],
                },
              },
            },
          }),
          terser(),
        ],
      })
    }
  })

  return config
}

export default build
