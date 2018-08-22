const fs = require('fs')
const path = require('path')
const zlib = require('zlib')
const uglify = require('uglify-js')
const rollup = require('rollup')
// const configs = require('./configs')

const buble = require('rollup-plugin-buble')
const flow = require('rollup-plugin-flow-no-whitespace')
const cjs = require('rollup-plugin-commonjs')
const node = require('rollup-plugin-node-resolve')
const replace = require('rollup-plugin-replace')

const vue = require('rollup-plugin-vue')
const babel = require('rollup-plugin-babel')

// const resolveee = require('rollup-plugin-node-resolve')

// console.log('looool', VuePlugin)

const version = require('../package.json').version
const banner =
`/*!
  * tiptap v${version}
  * (c) ${new Date().getFullYear()} Philipp Kühn
  * @license MIT
  */`


const resolve = _path => path.resolve(__dirname, '../', _path)

console.log(resolve('src/index.js'))

function genConfig(opts) {
  const config = {
    input: {
      input: resolve('src/index.js'),
      plugins: [
        // resolveee({
        //   extensions: [ '.mjs', '.js', '.jsx', '.json' ],
        // }),
				// vue.default(),
        // flow(),
				// babel(),
        node({
            extensions: [ '.mjs', '.js', '.jsx', '.json' ],
          }),
        // cjs(),
        // buble(),
      ],
    },
    output: {
      file: opts.file,
      format: opts.format,
      banner,
      name: 'tiptap',
    },
    external: [ 'vue', 'prosemirror-model' ]
  }

  if (opts.env) {
    config.input.plugins.unshift(replace({
      'process.env.NODE_ENV': JSON.stringify(opts.env)
    }))
  }

  return config
}

if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist')
}

const configs = [
  // browser dev
  {
    file: resolve('dist/tiptap.js'),
    format: 'umd',
    env: 'development'
  },
  // {
  //   file: resolve('dist/tiptap.min.js'),
  //   format: 'umd',
  //   env: 'production'
  // },
  // {
  //   file: resolve('dist/tiptap.common.js'),
  //   format: 'cjs'
  // },
  // {
  //   file: resolve('dist/tiptap.esm.js'),
  //   format: 'es'
  // }
].map(genConfig)

function build (builds) {
  let built = 0
  const total = builds.length
  const next = () => {
    buildEntry(builds[built]).then(() => {
      built++
      if (built < total) {
        next()
      }
    }).catch(logError)
  }

  next()
}

function buildEntry ({ input, output }) {
  const isProd = /min\.js$/.test(output.file)
  return rollup.rollup(input)
    .then(bundle => bundle.generate(output))
    .then(({ code }) => {
      if (isProd) {
        const minified = uglify.minify(code, {
          output: {
            preamble: output.banner,
            /* eslint-disable camelcase */
            ascii_only: true
            /* eslint-enable camelcase */
          }
        }).code
        return write(output.file, minified, true)
      } else {
        return write(output.file, code)
      }
    })
}

function write (dest, code, zip) {
  return new Promise((resolve, reject) => {
    function report (extra) {
      console.log(blue(path.relative(process.cwd(), dest)) + ' ' + getSize(code) + (extra || ''))
      resolve()
    }

    fs.writeFile(dest, code, err => {
      if (err) return reject(err)
      if (zip) {
        zlib.gzip(code, (err, zipped) => {
          if (err) return reject(err)
          report(' (gzipped: ' + getSize(zipped) + ')')
        })
      } else {
        report()
      }
    })
  })
}

function getSize (code) {
  return (code.length / 1024).toFixed(2) + 'kb'
}

function logError (e) {
  console.log(e)
}

function blue (str) {
  return '\x1b[1m\x1b[34m' + str + '\x1b[39m\x1b[22m'
}

build(configs)
