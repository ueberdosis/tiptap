import { Editor, Extension } from '@tiptap/core'
import { Node as ProsemirrorNode } from '@tiptap/pm/model'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

export interface PlaceholderOptions {
  /**
   * The CSS class name for the editor when it’s empty.
   * @default 'is-editor-empty'
   */
  emptyEditorClass: string

  /**
   * The CSS class name for an empty node.
   * @default 'is-empty'
   */
  emptyNodeClass: string

  /**
   * The placeholder text or a function to return the placeholder text.
   * @default 'Write something …'
   * @example (pos) => `Write something at ${pos} …`
   */
  placeholder:
    | ((PlaceholderProps: {
        editor: Editor
        node: ProsemirrorNode
        pos: number
        hasAnchor: boolean
      }) => string)
    | string

  /**
   * Show the placeholder only when the editor is editable.
   * @default true
   * @example false
   */
  showOnlyWhenEditable: boolean

  /**
   * Show the placeholder only when the current node is empty.
   * @default true
   * @example false
   */
  showOnlyCurrent: boolean

  /**
   * Include children when checking if a node is empty.
   * @default false
   * @example true
   */
  includeChildren: boolean
}

/**
 * This extension allows you to add a placeholder to your editor.
 * A placeholder is a text that appears when the editor or a node is empty.
 * @see https://www.tiptap.dev/api/extensions/placeholder
 */
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
