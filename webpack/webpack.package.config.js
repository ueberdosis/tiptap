import path from 'path'
import { VueLoaderPlugin } from 'vue-loader'
import { ifDev, removeEmpty } from './utilities'
import { rootPath, srcPath, buildPath } from './paths'

export default {

	mode: ifDev('development', 'production'),

	entry: {
		tiptap: removeEmpty([
			ifDev('webpack-hot-middleware/client?reload=true'),
			`${srcPath}/index.js`,
		]),
	},

	output: {
		path: `${buildPath}/`,
		filename: '[name].min.js',
		publicPath: '/',
	},

	resolve: {
		extensions: ['.js', '.scss', '.vue'],
		alias: {
			vue$: 'vue/dist/vue.esm.js',
			tiptap: path.resolve(rootPath, '../src'),
		},
		modules: [
			srcPath,
			path.resolve(rootPath, '../node_modules'),
		],
	},

	devtool: ifDev('eval-source-map', 'source-map'),

	module: {
		rules: [
			{
				test: /\.vue$/,
				loader: 'vue-loader',
			},
			{
				test: /\.js$/,
				loader: ifDev('babel-loader?cacheDirectory=true', 'babel-loader'),
				exclude: /node_modules/,
			},
		],
	},

	externals: {
    vue: 'vue',
  },

	plugins: removeEmpty([
		new VueLoaderPlugin(),
	]),

	node: {
		fs: 'empty',
	},

}
