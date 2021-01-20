import isClass from './isClass'

export default function isObject(item: any): boolean {
  if (!item) {
    return false
  }

  if (typeof item !== 'object') {
    return false
  }

  if (Array.isArray(item)) {
    return false
  }

  if (isClass(item)) {
    return false
  }

  return true
}
