import { ResolvedPos } from 'prosemirror-model'

export const getTextContentFromNodes = ($from: ResolvedPos, maxMatch = 500) => {
  let textBefore = ''

  $from.parent.nodesBetween(
    Math.max(0, $from.parentOffset - maxMatch),
    $from.parentOffset,
    (node, pos, parent, index) => {
      textBefore += node.type.spec.toText?.({
        node, pos, parent, index,
      }) || $from.nodeBefore?.text || '%leaf%'
    },
  )

  return textBefore
}
