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
      input: resolve('src/index.js'),
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
			external: ['vue'],
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
    file: resolve('dist/tiptap.js'),
    format: 'umd',
    env: 'development',
  },
  {
    file: resolve('dist/tiptap.min.js'),
    format: 'umd',
    env: 'production',
  },
  {
    file: resolve('dist/tiptap.common.js'),
    format: 'cjs',
  },
  {
    file: resolve('dist/tiptap.esm.js'),
    format: 'es',
  },
].map(genConfig)
