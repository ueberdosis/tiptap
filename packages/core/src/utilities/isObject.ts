import isClass from './isClass'

export default function isObject(value: any): boolean {
  return (
    value
    && typeof value === 'object'
    && !Array.isArray(value)
    && !isClass(value)
  )
}
