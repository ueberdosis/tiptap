import vue from 'rollup-plugin-vue'; // Handle .vue SFC files
import buble from 'rollup-plugin-buble'; // Transpile/polyfill with reasonable browser support
import cjs from 'rollup-plugin-commonjs'
import resolve from 'rollup-plugin-node-resolve'
export default {
    input: 'src/index.js', // Path relative to package.json
    // output: {
    //     name: 'MyComponent',
    //     exports: 'named',
		// },
		output: {format: "cjs", file: "dist/tiptap.min.js"},
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
};

// module.exports = {
//   input: "./src/index.js",
//   output: {format: "cjs", file: "dist/tiptap.min.js"},
//   sourcemap: true,
//   plugins: [
// 		// require("rollup-plugin-buble")(),
// 		// require('rollup-plugin-commonjs')(),
// 		require('rollup-plugin-babel')({
// 			babelrc: false,
// 			presets: [['@babel/preset-env', { modules: false }]]
// 		}),
// 		require('rollup-plugin-node-resolve')()
// 	],
// 	buble: {
//     objectAssign: 'Object.assign'
//   },
//   external(id) { return !/^[\.\/]/.test(id) }
// }