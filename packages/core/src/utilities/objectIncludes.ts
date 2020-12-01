import { AnyObject } from '../types'

/**
 * Check if object1 includes object2
 * @param object1 Object
 * @param object2 Object
 */
export default function objectIncludes(object1: AnyObject, object2: AnyObject): boolean {
  const keys = Object.keys(object2)

  if (!keys.length) {
    return true
  }

  return !!keys
    .filter(key => object2[key] === object1[key])
    .length
}
