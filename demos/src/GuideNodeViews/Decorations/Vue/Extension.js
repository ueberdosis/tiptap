import { mergeAttributes, Node } from '@tiptap/core'
import { Plugin } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import { VueNodeViewRenderer } from '@tiptap/vue-3'

import Component from './Component.vue'

export default Node.create({
  name: 'decorations',

  group: 'block',

  content: 'inline*',

  addAttributes() {
    return {
      highlight: {
        default: false,
        parseHTML: element => element.getAttribute('data-highlight') === 'true',
        renderHTML: attributes => ({
          'data-highlight': attributes.highlight,
        }),
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'decorations',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['decorations', mergeAttributes(HTMLAttributes), 0]
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          decorations(state) {
            const { doc } = state
            const decorations = []
            const nodeType = state.schema.nodes.decorations

            doc.descendants((node, pos) => {
              if (node.type === nodeType && node.attrs.highlight) {
                node.forEach((child, offset) => {
                  if (child.isText && child.text) {
                    const from = pos + 1 + offset
                    const to = from + child.text.length
                    decorations.push(
                      Decoration.inline(from, to, {
                        class: 'highlight-decoration',
                      }),
                    )
                  }
                })
              }
            })

            return DecorationSet.create(doc, decorations)
          },
        },
      }),
    ]
  },

  addNodeView() {
    return VueNodeViewRenderer(Component)
  },
})
