import { Editor, Extension } from '@tiptap/core'
import { Node as ProsemirrorNode } from '@tiptap/pm/model'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

export interface PlaceholderOptions {
  emptyEditorClass: string
  emptyNodeClass: string
  placeholder:
    | ((PlaceholderProps: {
        editor: Editor
        node: ProsemirrorNode
        pos: number
        hasAnchor: boolean
      }) => string)
    | string
  showOnlyWhenEditable: boolean
  showOnlyCurrent: boolean
  includeChildren: boolean
}

export const Placeholder = Extension.create<PlaceholderOptions>({
  name: 'placeholder',

  addOptions() {
    return {
      emptyEditorClass: 'is-editor-empty',
      emptyNodeClass: 'is-empty',
      placeholder: 'Write something …',
      showOnlyWhenEditable: true,
      showOnlyCurrent: true,
      includeChildren: false,
    }
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('placeholder'),
        props: {
          decorations: ({ doc, selection }) => {
            const active = this.editor.isEditable || !this.options.showOnlyWhenEditable
            const { anchor } = selection
            const decorations: Decoration[] = []

            if (!active) {
              return null
            }

            // only calculate isEmpty once due to its performance impacts (see issue #3360)
            const emptyDocInstance = doc.type.createAndFill()
            const isEditorEmpty = emptyDocInstance?.sameMarkup(doc)
              && emptyDocInstance.content.findDiffStart(doc.content) === null

            doc.descendants((node, pos) => {
              const hasAnchor = anchor >= pos && anchor <= pos + node.nodeSize
              const isEmpty = !node.isLeaf && !node.childCount

              if ((hasAnchor || !this.options.showOnlyCurrent) && isEmpty) {
                const classes = [this.options.emptyNodeClass]

                if (isEditorEmpty) {
                  classes.push(this.options.emptyEditorClass)
                }

                const decoration = Decoration.node(pos, pos + node.nodeSize, {
                  class: classes.join(' '),
                  'data-placeholder':
                    typeof this.options.placeholder === 'function'
                      ? this.options.placeholder({
                        editor: this.editor,
                        node,
                        pos,
                        hasAnchor,
                      })
                      : this.options.placeholder,
                })

                decorations.push(decoration)
              }

              return this.options.includeChildren
            })

            return DecorationSet.create(doc, decorations)
          },
        },
      }),
    ]
  },
})
