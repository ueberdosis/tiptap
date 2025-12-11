import { createWidgetDecoration, Extension, WidgetRenderer } from '@tiptap/vue-3'

import BlockActionsWidget from './BlockActionsWidget.vue'

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
                  pos: { from: pos, to: pos + node.nodeSize },
                  props: {
                    getPos,
                  },
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
