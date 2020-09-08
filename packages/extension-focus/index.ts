import { Extension } from '@tiptap/core'
import { Plugin } from 'prosemirror-state'
import { DecorationSet, Decoration } from 'prosemirror-view'

interface FocusOptions {
  className: string,
  nested: boolean,
}

export default new Extension<FocusOptions>()
  .name('focus')
  .defaults({
    className: 'has-focus',
    nested: false,
  })
  .plugins(({ editor, options }) => [
    new Plugin({
      props: {
        decorations: ({ doc, selection }) => {
          const { isEditable, isFocused } = editor
          const { anchor } = selection
          const decorations: Decoration[] = []

          if (!isEditable || !isFocused) {
            return
          }

          doc.descendants((node, pos) => {
            const hasAnchor = anchor >= pos && anchor <= (pos + node.nodeSize)

            if (hasAnchor && !node.isText) {
              const decoration = Decoration.node(pos, pos + node.nodeSize, {
                class: options.className,
              })
              decorations.push(decoration)
            }

            return options.nested
          })

          return DecorationSet.create(doc, decorations)
        },
      },
    }),
  ])
  .create()
