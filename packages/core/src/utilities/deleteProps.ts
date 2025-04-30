/**
 * Remove a property or an array of properties from an object
 * @param obj Object
 * @param key Key to remove
 */
export function deleteProps(obj: Record<string, any>, propOrProps: string | string[]): Record<string, any> {
  const props = typeof propOrProps === 'string' ? [propOrProps] : propOrProps

  return Object.keys(obj).reduce((newObj: Record<string, any>, prop) => {
    if (!props.includes(prop)) {
      newObj[prop] = obj[prop]
    }

    return newObj
  }, {})
}
