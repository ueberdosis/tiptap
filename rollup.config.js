module.exports = {
  input: "./src/index.js",
  output: {format: "cjs", file: "dist/tiptap.min.js"},
  sourcemap: true,
  plugins: [
		// require("rollup-plugin-buble")(),
		// require('rollup-plugin-commonjs')(),
		require('rollup-plugin-babel')({
			babelrc: false,
			presets: [['@babel/preset-env', { modules: false }]]
		}),
		require('rollup-plugin-node-resolve')()
	],
	buble: {
    objectAssign: 'Object.assign'
  },
  external(id) { return !/^[\.\/]/.test(id) }
}