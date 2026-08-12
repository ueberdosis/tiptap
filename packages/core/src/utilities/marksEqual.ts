import { attrsEqual } from './attrsEqual.js'

/**
 * Shape accepted by marksEqual, works with both JSONContent marks
 * (`{ type: 'bold' }`) and ProseMirror Mark objects (`{ type: MarkType }`).
 */
export type MarkLike = {
  type: string | { name: string }
  attrs?: Record<string, any> | null
}

function markTypeName(mark: MarkLike): string {
  return typeof mark.type === 'string' ? mark.type : mark.type.name
}

/**
 * Compare two arrays of mark objects for equality (order-insensitive).
 * Marks are matched by type name and attributes (via attrsEqual),
 * so key ordering in attrs does not matter, nor does mark array order.
 */
export function marksEqual(a: readonly MarkLike[], b: readonly MarkLike[]): boolean {
  if (a.length !== b.length) {
    return false
  }

  // Marks are matched by (type, attrs) identity, so greedy first-match works.
  const consumed = Array.from({ length: b.length }, () => false)

  return a.every(markA => {
    const nameA = markTypeName(markA)

    const idx = b.findIndex(
      (markB, i) =>
        !consumed[i] && nameA === markTypeName(markB) && attrsEqual(markA.attrs, markB.attrs),
    )

    if (idx === -1) {
      return false
    }

    consumed[idx] = true
    return true
  })
}
