export interface RangeOwnsPositionOptions {
  position: number
  from: number
  to: number
  /** `doc.content.size` of the document the range was computed against. */
  docSize: number
}

/**
 * Whether the block range `[from, to)` owns a decoration at `position`.
 *
 * `to` is the next block's start, so that block owns it. The last block is the
 * exception: nothing follows it, so it owns the end of the document.
 *
 * @param options The position, the range, and the document size.
 * @returns True when the range owns the position.
 * @example
 * // <p>foo</p><p>bar</p>, blocks [0, 5] and [5, 10]
 * rangeOwnsPosition({ position: 5, from: 0, to: 5, docSize: 10 }) // false, block 2 owns it
 * rangeOwnsPosition({ position: 5, from: 5, to: 10, docSize: 10 }) // true
 * rangeOwnsPosition({ position: 10, from: 5, to: 10, docSize: 10 }) // true, end of document
 */
export function rangeOwnsPosition({
  position,
  from,
  to,
  docSize,
}: RangeOwnsPositionOptions): boolean {
  if (position < from) {
    return false
  }

  if (position < to) {
    return true
  }

  return position === to && to === docSize
}
