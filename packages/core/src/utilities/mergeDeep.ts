import { AnyObject } from '../types'
import isPlainObject from './isPlainObject'

export default function mergeDeep(target: AnyObject, source: AnyObject): AnyObject {
  const output = { ...target }

  if (isPlainObject(target) && isPlainObject(source)) {
    Object.keys(source).forEach(key => {
      if (isPlainObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] })
        } else {
          output[key] = mergeDeep(target[key], source[key])
        }
      } else {
        Object.assign(output, { [key]: source[key] })
      }
    })
  }

  return output
}
