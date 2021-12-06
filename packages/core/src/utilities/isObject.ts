import { isClass } from './isClass'

export function isObject(value: any): boolean {
  return (
    value
    && typeof value === 'object'
    && !Array.isArray(value)
    && !isClass(value)
  )
}
