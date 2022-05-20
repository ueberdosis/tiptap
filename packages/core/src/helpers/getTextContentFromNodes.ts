import { ResolvedPos } from 'prosemirror-model'

export const getTextContentFromNodes = ($from: ResolvedPos<any>, maxMatch = 500) => {
  let textBefore = ''

  $from.parent.nodesBetween(
    Math.max(0, $from.parentOffset - maxMatch),
    $from.parentOffset,
    (node, pos, parent, index) => {
      textBefore += node.type.spec.toText?.({
        node, pos, parent, index,
      }) || node.textContent || '%leaf%'
    },
  )

  return textBefore
}
