import path from 'path'
import vue from 'rollup-plugin-vue'
import buble from 'rollup-plugin-buble'
import flow from 'rollup-plugin-flow-no-whitespace'
import cjs from 'rollup-plugin-commonjs'
import node from 'rollup-plugin-node-resolve'
import replace from 'rollup-plugin-replace'
import packagejson from '../../package.json'

const { version } = packagejson
const banner = `
  /*!
  * tiptap v${version}
  * (c) ${new Date().getFullYear()} Scrumpy UG (limited liability)
  * @license MIT
  */
`

const resolve = _path => path.resolve(__dirname, '../../', _path)

function genConfig(opts) {
  const config = {
    input: {
      input: opts.input,
      plugins: [
        flow(),
        node(),
        cjs(),
        vue({
          css: true,
          compileTemplate: true,
        }),
        replace({
          __VERSION__: version,
        }),
        buble({
          objectAssign: 'Object.assign',
        }),
      ],
      external(id) { return !/^[\.\/]/.test(id) },
    },
    output: {
      file: opts.file,
      format: opts.format,
      banner,
      name: 'tiptap',
    },
  }

  if (opts.env) {
    config.input.plugins.unshift(replace({
      'process.env.NODE_ENV': JSON.stringify(opts.env),
    }))
  }

  return config
}

export default [
  {
    package: 'tiptap',
    outputFileName: 'tiptap',
  },
  {
    package: 'tiptap-commands',
    outputFileName: 'commands',
  },
  {
    package: 'tiptap-utils',
    outputFileName: 'utils',
  },
  {
    package: 'tiptap-extensions',
    outputFileName: 'extensions',
  },
].map(item => [
  {
    input: resolve(`packages/${item.package}/src/index.js`),
    file: resolve(`packages/${item.package}/dist/${item.outputFileName}.js`),
    format: 'umd',
    env: 'development',
  },
  {
    input: resolve(`packages/${item.package}/src/index.js`),
    file: resolve(`packages/${item.package}/dist/${item.outputFileName}.min.js`),
    format: 'umd',
    env: 'production',
  },
  {
    input: resolve(`packages/${item.package}/src/index.js`),
    file: resolve(`packages/${item.package}/dist/${item.outputFileName}.common.js`),
    format: 'cjs',
  },
  {
    input: resolve(`packages/${item.package}/src/index.js`),
    file: resolve(`packages/${item.package}/dist/${item.outputFileName}.esm.js`),
    format: 'es',
  }])
  .reduce((allConfigs, configs) => ([
    ...allConfigs,
    ...configs,
  ]), [])
  .map(genConfig)
