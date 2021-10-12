import { Editor, Extension } from '@tiptap/core'
import { Node as ProsemirrorNode } from 'prosemirror-model'
import { Decoration, DecorationSet } from 'prosemirror-view'
import { Plugin } from 'prosemirror-state'

export interface PlaceholderOptions {
  emptyEditorClass: string,
  emptyNodeClass: string,
  placeholder: ((PlaceholderProps: {
    editor: Editor,
    node: ProsemirrorNode,
    pos: number,
  }) => string) | string,
  showOnlyWhenEditable: boolean,
  showOnlyCurrent: boolean,
  includeChildren: boolean,
}

export const Placeholder = Extension.create<PlaceholderOptions>({
  name: 'placeholder',

  defaultOptions: {
    emptyEditorClass: 'is-editor-empty',
    emptyNodeClass: 'is-empty',
    placeholder: 'Write something …',
    showOnlyWhenEditable: true,
    showOnlyCurrent: true,
    includeChildren: false,
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
              const isEmpty = !node.isLeaf && !node.childCount

              if ((hasAnchor || !this.options.showOnlyCurrent) && isEmpty) {
                const classes = [this.options.emptyNodeClass]

                if (this.editor.isEmpty) {
                  classes.push(this.options.emptyEditorClass)
                }

                const decoration = Decoration.node(pos, pos + node.nodeSize, {
                  class: classes.join(' '),
                  'data-placeholder': typeof this.options.placeholder === 'function'
                    ? this.options.placeholder({
                      editor: this.editor,
                      node,
                      pos,
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
