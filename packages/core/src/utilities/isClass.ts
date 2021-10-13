export default function isClass(value: any): boolean {
  if (value.constructor?.toString().substring(0, 5) !== 'class') {
    return false
  }

  return true
}
