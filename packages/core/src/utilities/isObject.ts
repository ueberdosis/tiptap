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

  if (item.constructor?.toString().substring(0, 5) === 'class') {
    return false
  }

  return true
}
