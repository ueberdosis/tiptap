/**
 * Compare two attribute objects for equality.
 * Handles null/undefined and asserts key presence in both objects so that
 * `{ foo: undefined }` and `{ bar: undefined }` are not treated as equal.
 */
export function attrsEqual(
  a: Record<string, any> | null | undefined,
  b: Record<string, any> | null | undefined,
): boolean {
  if (a === b) {
    return true
  }
  if (!a || !b) {
    return false
  }

  const keysA = Object.keys(a)
  const keysB = Object.keys(b)

  if (keysA.length !== keysB.length) {
    return false
  }

  return keysA.every(
    key => Object.prototype.hasOwnProperty.call(b, key) && Object.is(a[key], b[key]),
  )
}
