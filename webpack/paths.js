import path from 'path'

export const rootPath = __dirname
export const srcPath = path.resolve(rootPath, '../src')
export const buildPath = path.resolve(rootPath, '../dist')
export const examplesSrcPath = path.resolve(rootPath, '../examples')
export const examplesBuildPath = path.resolve(rootPath, '../docs')
export const sassImportPath = examplesSrcPath
