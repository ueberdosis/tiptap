import { createWidgetDecoration } from '@tiptap/core'
import { Extension, WidgetRenderer } from '@tiptap/react'

import { BlockActionsWidget } from './BlockActionsWidget.jsx'

export const BlockActionsExtension = Extension.create({
  name: 'blockActions',

  decorations: ({ editor }) => {
    return {
      create({ state }) {
        const decorations = []

        state.doc.descendants((node, pos) => {
          // Add actions to paragraphs and headings
          if ((node.type.name === 'paragraph' || node.type.name === 'heading') && node.textContent.trim().length > 0) {
            decorations.push(
              createWidgetDecoration(pos, (view, getPos) => {
                return WidgetRenderer.create(BlockActionsWidget, {
                  editor,
                  pos,
                  nodeSize: node.nodeSize,
                  nodeType: node.type.name,
                  getPos,
                })
              }),
            )
          }
        })

        return decorations
      },

      shouldUpdate: ({ tr }) => {
        return tr.docChanged
      },
    }
  },
})
