/**
 * Check if object1 includes object2
 * @param object1 Object
 * @param object2 Object
 */
export default function objectIncludes(object1: { [key: string ]: any }, object2: { [key: string ]: any }): boolean {
  return !!Object
    .keys(object2)
    .filter(key => object2[key] === object1[key])
    .length
}
