import type { Node, ResolvedPos } from '@tiptap/pm/model'

/**
 * Returns the block-level sibling immediately before the cursor's textblock
 * (or null when the cursor is at the first child of its block parent).
 *
 * The position does not have to sit inside a textblock: for any resolved
 * position, the result is the sibling immediately before `$pos.parent`. At a
 * GapCursor position this is the sibling before the whole container, not the
 * node before the gap.
 *
 * @param $pos The resolved position to look around
 * @returns The previous block-level sibling, or null
 * @example ```js
 * // Cursor in a top-level paragraph after a list:
 * // <ul><li>A</li></ul><p>|B</p>
 * getPreviousBlockSibling($from) // <ul>
 *
 * // Cursor in the second paragraph of a list item:
 * // <ul><li><p>A</p><p>|B</p></li></ul>
 * getPreviousBlockSibling($from) // <p>A</p>
 *
 * // Cursor in the first child of its block parent:
 * // <doc><p>|A</p></doc>
 * getPreviousBlockSibling($from) // null
 * ```
 */
export const getPreviousBlockSibling = ($pos: ResolvedPos): Node | null => {
  const parentDepth = $pos.depth - 1
  if (parentDepth < 0) return null

  const index = $pos.index(parentDepth)
  if (index === 0) return null

  return $pos.node(parentDepth).child(index - 1)
}
