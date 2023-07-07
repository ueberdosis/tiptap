import { isRegExp } from './isRegExp.js'

/**
 * Check if object1 includes object2
 * @param object1 Object
 * @param object2 Object
 */
export function objectIncludes(
  object1: Record<string, any>,
  object2: Record<string, any>,
  options: { strict: boolean } = { strict: true },
): boolean {
  const keys = Object.keys(object2)

  if (!keys.length) {
    return true
  }

  return keys.every(key => {
    if (options.strict) {
      return object2[key] === object1[key]
    }

    if (isRegExp(object2[key])) {
      return object2[key].test(object1[key])
    }

    return object2[key] === object1[key]
  })
}
