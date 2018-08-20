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
import { rootPath, srcPath, examplesSrcPath, examplesBuildPath, buildPath } from './paths'

export default {

	mode: ifDev('development', 'production'),

	entry: {
		examples: removeEmpty([
			ifDev('webpack-hot-middleware/client?reload=true'),
			`${examplesSrcPath}/assets/sass/main.scss`,
			`${examplesSrcPath}/main.js`,
		]),
	},

	output: {
		path: `${examplesBuildPath}/`,
		filename: `assets/js/[name]${ifProd('.[hash]', '')}.js`,
		chunkFilename: `assets/js/[name]${ifProd('.[chunkhash]', '')}.js`,
		publicPath: '/',
	},

	resolve: {
		extensions: ['.js', '.scss', '.vue'],
		alias: {
			vue$: 'vue/dist/vue.esm.js',
			modernizr: path.resolve(rootPath, '../.modernizr'),
			modules: path.resolve(rootPath, '../node_modules'),
			images: `${examplesSrcPath}/assets/images`,
			fonts: `${examplesSrcPath}/assets/fonts`,
			variables: `${examplesSrcPath}/assets/sass/variables`,
			settings: `${examplesSrcPath}/assets/sass/1-settings/index`,
			utilityFunctions: `${examplesSrcPath}/assets/sass/2-utility-functions/index`,
			tiptap: path.resolve(rootPath, '../src'),
		},
		modules: [
			examplesSrcPath,
			path.resolve(rootPath, '../node_modules'),
		],
	},

	devtool: ifDev('eval-source-map', 'source-map'),

	module: {
		rules: [
			{
				test: /\.modernizr$/,
				loader: 'modernizr-loader',
			},
			{
				test: /\.vue$/,
				loader: 'vue-loader',
			},
			{
				test: /\.js$/,
				loader: ifDev('babel-loader?cacheDirectory=true', 'babel-loader'),
				exclude: /node_modules(?!\/quill)/,
			},
			{
				test: /\.(graphql|gql)$/,
				loader: 'graphql-tag/loader',
				exclude: /node_modules/,
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

		// copy static files
		new CopyWebpackPlugin([
			{
				context: `${examplesSrcPath}/assets/static`,
				from: { glob: '**/*', dot: false },
				to: `${examplesBuildPath}/assets`,
			},
		]),

		// enable hot reloading
		ifDev(new webpack.HotModuleReplacementPlugin()),

		// make some packages available everywhere
		new webpack.ProvidePlugin({
			// $: 'jquery',
			// jQuery: 'jquery',
			// 'window.jQuery': 'jquery',
			collect: 'collect.js',
		}),

		// html
		new HtmlWebpackPlugin({
			filename: 'index.html',
			template: `${examplesSrcPath}/index.html`,
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
