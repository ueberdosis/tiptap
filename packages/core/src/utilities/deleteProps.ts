/**
 * Remove a property or an array of properties from an object
 * @param obj Object
 * @param key Key to remove
 */
export default function deleteProps(obj: { [key: string ]: any }, propOrProps: string | string[]) {
  const props = typeof propOrProps === 'string'
    ? [propOrProps]
    : propOrProps

  return Object
    .keys(obj)
    .reduce((newObj: { [key: string ]: any }, prop) => {
      if (!props.includes(prop)) {
        newObj[prop] = obj[prop]
      }

      return newObj
    }, {})
}
