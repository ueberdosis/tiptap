import { ResolvedPos } from 'prosemirror-model'

export const getTextContentFromNodes = ($from: ResolvedPos, maxMatch = 500) => {
  let textBefore = ''

  const to = $from.parentOffset
  $from.parent.nodesBetween(
    Math.max(0, to - maxMatch),
    to,
    (node, pos, parent, index) => {
      const chunk = node.type.spec.toText?.({
        node, pos, parent, index,
      }) || node.textContent || '%leaf%'
      textBefore += chunk.slice(0, Math.max(0, to - pos))
    },
  )

  return textBefore
}
