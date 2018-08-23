import path from 'path'
import webpack from 'webpack'
import { VueLoaderPlugin } from 'vue-loader'
import SvgStore from 'webpack-svgstore-plugin'
import CopyWebpackPlugin from 'copy-webpack-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import ManifestPlugin from 'webpack-manifest-plugin'
import ImageminWebpackPlugin from 'imagemin-webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import OptimizeCssAssetsPlugin from 'optimize-css-assets-webpack-plugin'
import { ifDev, ifProd, removeEmpty } from './utilities'
import { rootPath, srcPath, buildPath } from './paths'

export default {

	mode: ifDev('development', 'production'),

	entry: {
		app: removeEmpty([
			ifDev('webpack-hot-middleware/client?reload=true'),
			`${srcPath}/assets/sass/main.scss`,
			`${srcPath}/main.js`,
		]),
	},

	output: {
		path: `${buildPath}/`,
		filename: `assets/js/[name]${ifProd('.[hash]', '')}.js`,
		chunkFilename: `assets/js/[name]${ifProd('.[chunkhash]', '')}.js`,
		publicPath: '/',
	},

	resolve: {
		extensions: ['.js', '.scss', '.vue'],
		alias: {
			vue$: 'vue/dist/vue.esm.js',
			modules: path.resolve(rootPath, '../node_modules'),
			images: `${srcPath}/assets/images`,
			fonts: `${srcPath}/assets/fonts`,
			variables: `${srcPath}/assets/sass/variables`,
			tiptap: path.resolve(rootPath, '../packages/tiptap/src'),
			'tiptap-commands': path.resolve(rootPath, '../packages/tiptap-commands/src'),
			'tiptap-utils': path.resolve(rootPath, '../packages/tiptap-utils/src'),
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
				exclude: [/node_modules/, /packages/],
			},
			{
				test: /\.css$/,
				use: removeEmpty([
					ifDev('vue-style-loader', MiniCssExtractPlugin.loader),
					'css-loader',
					'postcss-loader',
				]),
			},
			{
				test: /\.scss$/,
				use: removeEmpty([
					ifDev('vue-style-loader', MiniCssExtractPlugin.loader),
					'css-loader',
					'postcss-loader',
					'sass-loader',
				]),
			},
			{
				test: /\.(png|jpe?g|gif|svg|ico)(\?.*)?$/,
				use: {
					loader: 'file-loader',
					options: {
						name: `assets/images/[name]${ifProd('.[hash]', '')}.[ext]`,
					},
				},
			},
			{
				test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
				use: {
					loader: 'file-loader',
					options: {
						name: `assets/fonts/[name]${ifProd('.[hash]', '')}.[ext]`,
					},
				},
			},
		],
	},

	// splitting out the vendor
	optimization: {
		namedModules: true,
		splitChunks: {
			name: 'vendor',
			minChunks: 2,
		},
		noEmitOnErrors: true,
		// concatenateModules: true,
	},

	plugins: removeEmpty([

		// create manifest file for server-side asset manipulation
		new ManifestPlugin({
			fileName: 'assets/manifest.json',
			writeToFileEmit: true,
		}),

		// define env
		// new webpack.DefinePlugin({
		// 	'process.env': {},
		// }),

		// enable hot reloading
		ifDev(new webpack.HotModuleReplacementPlugin()),

		// html
		new HtmlWebpackPlugin({
			filename: 'index.html',
			template: `${srcPath}/index.html`,
			inject: true,
			minify: ifProd({
				removeComments: true,
				collapseWhitespace: true,
				removeAttributeQuotes: true,
			}),
			buildVersion: new Date().valueOf(),
			chunksSortMode: 'none',
		}),

		new VueLoaderPlugin(),

		// create css files
		ifProd(new MiniCssExtractPlugin({
			filename: `assets/css/[name]${ifProd('.[hash]', '')}.css`,
			chunkFilename: `assets/css/[name]${ifProd('.[hash]', '')}.css`,
		})),

		// minify css files
		ifProd(new OptimizeCssAssetsPlugin({
			cssProcessorOptions: {
				reduceIdents: false,
				autoprefixer: false,
				zindex: false,
				discardComments: {
					removeAll: true,
				},
			},
		})),

		// svg icons
		new SvgStore({
			prefix: 'icon--',
			svgoOptions: {
				plugins: [
					{ cleanupIDs: false },
					{ collapseGroups: false },
					{ removeTitle: true },
				],
			},
		}),

		// image optimization
		new ImageminWebpackPlugin({
			optipng: ifDev(null, {
				optimizationLevel: 3,
			}),
			jpegtran: ifDev(null, {
				progressive: true,
				quality: 80,
			}),
			svgo: ifDev(null, {
				plugins: [
					{ cleanupIDs: false },
					{ removeViewBox: false },
					{ removeUselessStrokeAndFill: false },
					{ removeEmptyAttrs: false },
				],
			}),
		}),

	]),

	node: {
		fs: 'empty',
	},

}
