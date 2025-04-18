import type { ResolvedPos } from '@tiptap/pm/model'

/**
 * Returns the text content of a resolved prosemirror position
 * @param $from The resolved position to get the text content from
 * @param maxMatch The maximum number of characters to match
 * @returns The text content
 */
export const getTextContentFromNodes = ($from: ResolvedPos, maxMatch = 500) => {
  let textBefore = ''

  const sliceEndPos = $from.parentOffset

  $from.parent.nodesBetween(Math.max(0, sliceEndPos - maxMatch), sliceEndPos, (node, pos, parent, index) => {
    const chunk =
      node.type.spec.toText?.({
        node,
        pos,
        parent,
        index,
      }) ||
      node.textContent ||
      '%leaf%'

    textBefore += node.isAtom && !node.isText ? chunk : chunk.slice(0, Math.max(0, sliceEndPos - pos))
  })

  return textBefore
}
