import { Extension } from '@tiptap/react'

export const SelectionDecorations = Extension.create({
  name: 'selectionDecoration',

  decorations: {
    create({ state }) {
      const nodeSelection = {
        from: state.selection.$from.start(1) - 1,
        to: state.selection.$to.end(1) + 1,
      }

      const nodeDecoration = {
        from: Math.max(0, nodeSelection.from),
        to: Math.min(state.doc.nodeSize, nodeSelection.to),
        type: 'node',
        attributes: { class: 'selected-node' },
      }

      const textDecoration = {
        from: Math.max(0, state.selection.from),
        to: Math.min(state.selection.to),
        type: 'inline',
        attributes: { class: 'selected-text' },
      }

      if (state.selection.empty) {
        return [nodeDecoration]
      }

      return [nodeDecoration, textDecoration]
    },
  },
})
