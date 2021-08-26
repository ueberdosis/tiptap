import { Node, mergeAttributes } from '@tiptap/core'
import { Plugin } from 'prosemirror-state'

export const Figure = Node.create({
  name: 'figure',

  defaultOptions: {
    HTMLAttributes: {},
  },

  group: 'block',

  content: 'block figcaption',

  draggable: true,

  isolating: true,

  parseHTML() {
    return [
      {
        tag: `figure[data-type="${this.name}"]`,
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['figure', mergeAttributes(HTMLAttributes, { 'data-type': this.name }), 0]
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          handleDOMEvents: {
            // prevent dragging nodes out of the figure
            dragstart: (view, event) => {
              if (!event.target) {
                return false
              }

              const pos = view.posAtDOM(event.target as HTMLElement, 0)
              const $pos = view.state.doc.resolve(pos)

              if ($pos.parent.type === this.type) {
                event.preventDefault()
              }

              return false
            },
          },
        },
      }),
    ]
  },
})
