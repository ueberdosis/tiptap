export default function isClass(item: any): boolean {
  if (item.constructor?.toString().substring(0, 5) !== 'class') {
    return false
  }

  return true
}
