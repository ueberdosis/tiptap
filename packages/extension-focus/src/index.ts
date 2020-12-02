import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from 'prosemirror-state'
import { DecorationSet, Decoration } from 'prosemirror-view'

export interface FocusOptions {
  className: string,
  nested: boolean,
}

const FocusClasses = Extension.create({
  name: 'focus',

  defaultOptions: <FocusOptions>{
    className: 'has-focus',
    nested: false,
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('focus'),
        props: {
          decorations: ({ doc, selection }) => {
            const { isEditable, isFocused } = this.editor
            const { anchor } = selection
            const decorations: Decoration[] = []

            if (!isEditable || !isFocused) {
              return DecorationSet.create(doc, [])
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
  },
})

export default FocusClasses

declare module '@tiptap/core' {
  interface AllExtensions {
    FocusClasses: typeof FocusClasses,
  }
}
