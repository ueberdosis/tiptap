import { Extension, isNodeEmpty } from '@tiptap/core'
import { Decoration, DecorationSet } from 'prosemirror-view'
import { Plugin } from 'prosemirror-state'

export interface PlaceholderOptions {
  emptyEditorClass: string,
  emptyNodeClass: string,
  placeholder: string | Function,
  showOnlyWhenEditable: boolean,
  showOnlyCurrent: boolean,
}

export const Placeholder = Extension.create<PlaceholderOptions>({
  name: 'placeholder',

  defaultOptions: {
    emptyEditorClass: 'is-editor-empty',
    emptyNodeClass: 'is-empty',
    placeholder: 'Write something …',
    showOnlyWhenEditable: true,
    showOnlyCurrent: true,
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          decorations: ({ doc, selection }) => {
            const active = this.editor.isEditable || !this.options.showOnlyWhenEditable
            const { anchor } = selection
            const decorations: Decoration[] = []

            if (!active) {
              return
            }

            doc.descendants((node, pos) => {
              const hasAnchor = anchor >= pos && anchor <= (pos + node.nodeSize)
              const isEmpty = !node.isLeaf && isNodeEmpty(node)

              if ((hasAnchor || !this.options.showOnlyCurrent) && isEmpty) {
                const classes = [this.options.emptyNodeClass]

                if (this.editor.isEmpty) {
                  classes.push(this.options.emptyEditorClass)
                }

                const decoration = Decoration.node(pos, pos + node.nodeSize, {
                  class: classes.join(' '),
                  'data-placeholder': typeof this.options.placeholder === 'function'
                    ? this.options.placeholder(node)
                    : this.options.placeholder,
                })

                decorations.push(decoration)
              }

              return false
            })

            return DecorationSet.create(doc, decorations)
          },
        },
      }),
    ]
  },
})
