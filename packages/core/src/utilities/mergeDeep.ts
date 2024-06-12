import { isPlainObject } from './isPlainObject.js'

export function mergeDeep(target: Record<string, any>, source: Record<string, any>): Record<string, any> {
  const output = { ...target }

  if (isPlainObject(target) && isPlainObject(source)) {
    Object.keys(source).forEach(key => {
      if (isPlainObject(source[key]) && isPlainObject(target[key])) {
        output[key] = mergeDeep(target[key], source[key])
      } else {
        output[key] = source[key]
      }
    })
  }

  return output
}
