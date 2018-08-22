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
		vue({
			css: true,
			compileTemplate: true,
		}),
		cjs(),
		buble({
			objectAssign: 'Object.assign',
		}),
		resolve(),
	],
}