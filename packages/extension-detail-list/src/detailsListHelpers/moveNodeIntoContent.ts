import { Editor } from '@tiptap/core'
import { TextSelection } from '@tiptap/pm/state'

import { NodePosition } from './nodePosition.js'
import type { DetailsListOptions } from './type'

export const moveNodeIntoContent = (editor: Editor, options: DetailsListOptions) => {
  const { $anchor } = editor.state.selection
  const nodePos = new NodePosition($anchor)

  const { before } = nodePos

  const isAtStart = $anchor.parentOffset === 0

  if (!before || before.node.type.name !== options.contentNodeType || !isAtStart) {
    return false
  }

  const contentSlice = editor.state.doc.slice(nodePos.from + 1, nodePos.to - 1)

  return editor
    .chain()
    .insertContentAt(before.to - 2, contentSlice.content.toJSON())
    .command(({ tr }) => {
      const newFrom = tr.mapping.map(nodePos.from)
      const newTo = tr.mapping.map(nodePos.to)

      tr.deleteRange(newFrom, newTo)
      return true
    })
    .command(({ tr }) => {
      tr.setSelection(TextSelection.create(tr.doc, before.to - 2))
      return true
    })
    // .insertContentAt(before.to - 2, contentSlice.content.toJSON())
    .run()
}
