import { Extension } from '@tiptap/core'
import { Plugin } from 'prosemirror-state'
import { DecorationSet, Decoration } from 'prosemirror-view'

export default class Focus extends Extension {

  name = 'focus'

  defaultOptions() {
    return {
      className: 'has-focus',
      nested: false,
    }
  }

  plugins() {
    return [
      new Plugin({
        props: {
          decorations: ({ doc, plugins, selection }) => {
            const { isFocused, isEditable } = this.editor
            const isActive = isEditable && this.options.className
            const { anchor } = selection
            const decorations: Decoration[] = []

            if (!isActive || !isFocused) {
              return
            }

            doc.descendants((node, pos) => {
              const hasAnchor = anchor >= pos && anchor <= (pos + node.nodeSize)

              if (hasAnchor && !node.isText) {
                const decoration = Decoration.node(pos, pos + node.nodeSize, {
                  class: this.options.className,
                })
                decorations.push(decoration)
              }

              return this.options.nested
            })

            return DecorationSet.create(doc, decorations)
          },
        },
      }),
    ]
  }

}
