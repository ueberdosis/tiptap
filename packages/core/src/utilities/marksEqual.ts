import { attrsEqual } from './attrsEqual.js'

/**
 * Compare two arrays of mark objects for equality.
 * Marks are compared by type and attributes (using attrsEqual),
 * so key ordering in attrs does not matter.
 */
export function marksEqual(
  a: { type: string; attrs?: Record<string, any> }[],
  b: { type: string; attrs?: Record<string, any> }[],
): boolean {
  if (a.length !== b.length) {
    return false
  }

  return a.every((mark, i) => {
    const other = b[i]
    return mark.type === other.type && attrsEqual(mark.attrs, other.attrs)
  })
}
