import path from 'path'
import minimist from 'minimist'
import { getPackages } from '@lerna/project'
import filterPackages from '@lerna/filter-packages'
import batchPackages from '@lerna/batch-packages'
import typescript from 'rollup-plugin-typescript2'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import babel from '@rollup/plugin-babel'
import { terser } from 'rollup-plugin-terser'

async function getSortedPackages(scope, ignore) {
  const packages = await getPackages(__dirname)
  const filtered = filterPackages(packages, scope, ignore, false)

  return batchPackages(filtered).reduce((arr, batch) => arr.concat(batch), [])
}

async function main(commandLineArgs) {
  const config = []
  // Support --scope and --ignore globs if passed in via commandline
  const { scope, ignore } = minimist(process.argv.slice(2))
  const packages = await getSortedPackages(scope, ignore)

  // prevent rollup warning
  delete commandLineArgs.scope
  delete commandLineArgs.ignore

  packages.forEach(pkg => {
    /* Absolute path to package directory */
    const basePath = path.relative(__dirname, pkg.location)
    /* Absolute path to input file */
    const input = path.join(basePath, 'index.ts')
    /* "main" field from package.json file. */
    const { main } = pkg.toJSON()
    /* Push build config for this package. */

    config.push({
      input,
      output: [
        {
          file: path.join(basePath, main),
          format: 'cjs',
        },
      ],
      external: [
        ...Object.keys(pkg.dependencies || {}),
        ...Object.keys(pkg.devDependencies || {}),
        ...Object.keys(pkg.peerDependencies || {}),
      ],
      plugins: [
        resolve(),
        commonjs(),
        typescript(),
        babel({
          babelHelpers: 'bundled',
        }),
        terser(),
      ],
    })
  })

  return config
}

export default main
