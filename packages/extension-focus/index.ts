import { Extension } from '@tiptap/core'
import { Plugin } from 'prosemirror-state'
import { DecorationSet, Decoration } from 'prosemirror-view'

interface FocusOptions {
  className: string,
  nested: boolean,
}

export default class Focus extends Extension {

  name = 'focus'

  constructor(options: Partial<FocusOptions> = {}) {
    super(options)
  }

  defaultOptions(): FocusOptions {
    return {
      className: 'has-focus',
      nested: false,
    }
  }

  plugins() {
    return [
      new Plugin({
        props: {
          decorations: ({ doc, selection }) => {
            const { isEditable, isFocused } = this.editor
            const { anchor } = selection
            const decorations: Decoration[] = []

            if (!isEditable || !isFocused) {
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
