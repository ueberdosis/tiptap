import fs from 'fs'
import path from 'path'
import glob from 'glob'
import minimist from 'minimist'

let argv = minimist(process.argv.slice(2))

export function removeEmpty(array) {
  return array.filter(entry => !!entry)
}

export function ifElse(condition) {
  return (then, otherwise) => (condition ? then : otherwise)
}

export const env = argv.env || 'development'
export const use = argv.use || null
export const isDev = use ? use === 'development' : env === 'development'
export const isProd = use ? use === 'production' : env === 'production'
export const isTest = env === 'testing'
export const ifDev = ifElse(isDev)
export const ifProd = ifElse(isProd)
export const ifTest = ifElse(isTest)

export function sassImport(basePath) {
  const indexFileName = 'index.scss'
  glob.sync(`${basePath}/**/${indexFileName}`).forEach(sourceFile => {
    fs.writeFileSync(sourceFile, '// This is a dynamically generated file \n\n')
    glob.sync(`${path.dirname(sourceFile)}/*.scss`).forEach(file => {
      if (path.basename(file) !== indexFileName) {
        fs.appendFileSync(sourceFile, `@import "${path.basename(file)}";\n`)
      }
    })
  })

  const indexSubFileName = 'index_sub.scss'
  glob.sync(`${basePath}/**/${indexSubFileName}`).forEach(sourceFile => {
    fs.writeFileSync(sourceFile, '// This is a dynamically generated file \n\n')
    glob.sync(`${path.dirname(sourceFile)}/**/*.scss`).forEach(file => {
      if (path.basename(file) !== indexSubFileName) {
        let importPath = (path.dirname(sourceFile) === path.dirname(file)) ? path.basename(file) : file
        importPath = importPath.replace(`${path.dirname(sourceFile)}/`, '')
        fs.appendFileSync(sourceFile, `@import "${importPath}";\n`)
      }
    })
  })
}
