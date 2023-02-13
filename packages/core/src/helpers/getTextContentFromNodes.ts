import { ResolvedPos } from '@tiptap/pm/model'

export const getTextContentFromNodes = ($from: ResolvedPos, maxMatch = 500) => {
  let textBefore = ''

  const sliceEndPos = $from.parentOffset

  $from.parent.nodesBetween(
    Math.max(0, sliceEndPos - maxMatch),
    sliceEndPos,
    (node, pos, parent, index) => {
      const chunk = node.type.spec.toText?.({
        node,
        pos,
        parent,
        index,
      })
        || node.textContent
        || '%leaf%'

      textBefore += chunk.slice(0, Math.max(0, sliceEndPos - pos))
    },
  )

  return textBefore
}
