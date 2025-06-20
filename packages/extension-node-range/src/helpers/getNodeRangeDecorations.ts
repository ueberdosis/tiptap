import type { SelectionRange } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

export function getNodeRangeDecorations(ranges: SelectionRange[]): DecorationSet {
  if (!ranges.length) {
    return DecorationSet.empty
  }

  const decorations: Decoration[] = []
  const doc = ranges[0].$from.node(0)

  ranges.forEach(range => {
    const pos = range.$from.pos
    const node = range.$from.nodeAfter

    if (!node) {
      return
    }

    decorations.push(
      Decoration.node(pos, pos + node.nodeSize, {
        class: 'ProseMirror-selectednoderange',
      }),
    )
  })

  return DecorationSet.create(doc, decorations)
}
