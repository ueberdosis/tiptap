import vue from 'rollup-plugin-vue'
import buble from 'rollup-plugin-buble'
import cjs from 'rollup-plugin-commonjs'
import resolve from 'rollup-plugin-node-resolve'

export default {
	input: 'src/index.js',
	output: {
		name: 'tiptap',
		exports: 'named',
		format: 'cjs',
		file: 'dist/tiptap.min.js',
	},
	sourcemap: true,
	plugins: [
		resolve(),
		cjs(),
		vue({
			css: true,
			compileTemplate: true,
		}),
		buble({
			objectAssign: 'Object.assign',
		}),
	],
	external: ['vue'],
}
