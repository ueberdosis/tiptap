import fs from 'fs'
import path from 'path'
import zlib from 'zlib'
import uglify from 'uglify-js'
import { rollup } from 'rollup'
import config from './config'

function getSize(code) {
  return `${(code.length / 1024).toFixed(2)}kb`
}

function logError(e) {
  console.log(e)
}

function blue(str) {
  return `\x1b[1m\x1b[34m${str}\x1b[39m\x1b[22m`
}

function write(dest, code, zip) {
  return new Promise((resolve, reject) => {
    function report(extra) {
      console.log(`${blue(path.relative(process.cwd(), dest)) } ${getSize(code) }${extra || ''}`)
      resolve()
    }

    fs.writeFile(dest, code, error => {
      if (error) return reject(error)
      if (zip) {
        zlib.gzip(code, (err, zipped) => {
          if (err) return reject(err)
          report(` (gzipped: ${getSize(zipped)})`)
        })
      } else {
        report()
      }
    })
  })
}

function buildEntry({ input, output }) {
  const isProd = /min\.js$/.test(output.file)
  return rollup(input)
    .then(bundle => bundle.generate(output))
    .then(({ code }) => {
      if (isProd) {
        const minified = uglify.minify(code, {
          output: {
            preamble: output.banner,
            ascii_only: true,
          },
        }).code
        return write(output.file, minified, true)
      }
      return write(output.file, code)
    })
}

function build(builds) {
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

build(config)
