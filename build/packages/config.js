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
      external: opts.external,
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
    input: resolve('packages/tiptap/src/index.js'),
    file: resolve('packages/tiptap/dist/tiptap.js'),
    format: 'umd',
    env: 'development',
    external: ['vue'],
  },
  {
    input: resolve('packages/tiptap/src/index.js'),
    file: resolve('packages/tiptap/dist/tiptap.min.js'),
    format: 'umd',
    env: 'production',
    external: ['vue'],
  },
  {
    input: resolve('packages/tiptap/src/index.js'),
    file: resolve('packages/tiptap/dist/tiptap.common.js'),
    format: 'cjs',
    external: ['vue'],
  },
  {
    input: resolve('packages/tiptap/src/index.js'),
    file: resolve('packages/tiptap/dist/tiptap.esm.js'),
    format: 'es',
    external: ['vue'],
  },

  {
    input: resolve('packages/tiptap-commands/src/index.js'),
    file: resolve('packages/tiptap-commands/dist/commands.js'),
    format: 'umd',
    env: 'development',
    external: [],
  },
  {
    input: resolve('packages/tiptap-commands/src/index.js'),
    file: resolve('packages/tiptap-commands/dist/commands.min.js'),
    format: 'umd',
    env: 'production',
    external: [],
  },
  {
    input: resolve('packages/tiptap-commands/src/index.js'),
    file: resolve('packages/tiptap-commands/dist/commands.common.js'),
    format: 'cjs',
    external: [],
  },
  {
    input: resolve('packages/tiptap-commands/src/index.js'),
    file: resolve('packages/tiptap-commands/dist/commands.esm.js'),
    format: 'es',
    external: [],
  },

  {
    input: resolve('packages/tiptap-utils/src/index.js'),
    file: resolve('packages/tiptap-utils/dist/utils.js'),
    format: 'umd',
    env: 'development',
    external: [],
  },
  {
    input: resolve('packages/tiptap-utils/src/index.js'),
    file: resolve('packages/tiptap-utils/dist/utils.min.js'),
    format: 'umd',
    env: 'production',
    external: [],
  },
  {
    input: resolve('packages/tiptap-utils/src/index.js'),
    file: resolve('packages/tiptap-utils/dist/utils.common.js'),
    format: 'cjs',
    external: [],
  },
  {
    input: resolve('packages/tiptap-utils/src/index.js'),
    file: resolve('packages/tiptap-utils/dist/utils.esm.js'),
    format: 'es',
    external: [],
  },

  {
    input: resolve('packages/tiptap-extensions/src/index.js'),
    file: resolve('packages/tiptap-extensions/dist/extensions.js'),
    format: 'umd',
    env: 'development',
    external: [],
  },
  {
    input: resolve('packages/tiptap-extensions/src/index.js'),
    file: resolve('packages/tiptap-extensions/dist/extensions.min.js'),
    format: 'umd',
    env: 'production',
    external: [],
  },
  {
    input: resolve('packages/tiptap-extensions/src/index.js'),
    file: resolve('packages/tiptap-extensions/dist/extensions.common.js'),
    format: 'cjs',
    external: [],
  },
  {
    input: resolve('packages/tiptap-extensions/src/index.js'),
    file: resolve('packages/tiptap-extensions/dist/extensions.esm.js'),
    format: 'es',
    external: [],
  },
].map(genConfig)
