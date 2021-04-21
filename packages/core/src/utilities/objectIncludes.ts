/**
 * Check if object1 includes object2
 * @param object1 Object
 * @param object2 Object
 */
export default function objectIncludes(object1: Record<string, any>, object2: Record<string, any>): boolean {
  const keys = Object.keys(object2)

  if (!keys.length) {
    return true
  }

  return !!keys
    .filter(key => object2[key] === object1[key])
    .length
}
