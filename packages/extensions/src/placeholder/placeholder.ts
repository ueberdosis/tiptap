import { Extension, isNodeEmpty } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import type { Decoration } from '@tiptap/pm/view'
import { DecorationSet } from '@tiptap/pm/view'

import type { PlaceholderOptions } from './types.js'
import { createPlaceholderDecoration } from './utils/createPlaceholderDecoration.js'

/**
 * The default data attribute label
 */
const DEFAULT_DATA_ATTRIBUTE = 'placeholder'

/**
 * Prepares the placeholder attribute by ensuring it is properly formatted.
 * @param attr - The placeholder attribute string.
 * @returns The prepared placeholder attribute string.
 */
export function preparePlaceholderAttribute(attr: string): string {
  return (
    attr
      // replace whitespace with dashes
      .replace(/\s+/g, '-')
      // replace non-alphanumeric  characters
      // or special chars like $, %, &, etc.
      // but not dashes
      .replace(/[^a-zA-Z0-9-]/g, '')
      // and replace any numeric character at the start
      .replace(/^[0-9-]+/, '')
      // and finally replace any stray, leading dashes
      .replace(/^-+/, '')
      .toLowerCase()
  )
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
      dataAttribute: DEFAULT_DATA_ATTRIBUTE,
      placeholder: 'Write something …',
      showOnlyWhenEditable: true,
      showOnlyCurrent: true,
      includeChildren: false,
    }
  },

  addProseMirrorPlugins() {
    const dataAttribute = this.options.dataAttribute
      ? `data-${preparePlaceholderAttribute(this.options.dataAttribute)}`
      : `data-${DEFAULT_DATA_ATTRIBUTE}`

    return [
      new Plugin({
        key: new PluginKey('placeholder'),
        props: {
          decorations: ({ doc, selection }) => {
            const active = this.editor.isEditable || !this.options.showOnlyWhenEditable

            if (!active) {
              return null
            }

            const { anchor } = selection
            const decorations: Decoration[] = []
            const isEmptyDoc = this.editor.isEmpty

            if (this.options.showOnlyCurrent && !this.options.includeChildren) {
              const resolved = doc.resolve(anchor)

              if (resolved.depth > 0) {
                const node = resolved.node(1)

                if (node.type.isTextblock && isNodeEmpty(node)) {
                  const decoration = createPlaceholderDecoration({
                    node,
                    dataAttribute,
                    hasAnchor: false,
                    placeholder: this.options.placeholder,
                    classes: {
                      emptyEditor: this.options.emptyEditorClass,
                      emptyNode: this.options.emptyNodeClass,
                    },
                    editor: this.editor,
                    isEmptyDoc,
                    pos: resolved.before(1),
                  })

                  decorations.push(decoration)
                }
              }
            } else {
              doc.descendants((node, pos) => {
                const hasAnchor = anchor >= pos && anchor <= pos + node.nodeSize
                const isEmpty = !node.isLeaf && isNodeEmpty(node)

                if (!node.type.isTextblock) {
                  return this.options.includeChildren
                }

                if ((hasAnchor || !this.options.showOnlyCurrent) && isEmpty) {
                  const decoration = createPlaceholderDecoration({
                    classes: { emptyEditor: this.options.emptyEditorClass, emptyNode: this.options.emptyNodeClass },
                    editor: this.editor,
                    isEmptyDoc,
                    dataAttribute,
                    hasAnchor,
                    placeholder: this.options.placeholder,
                    node,
                    pos,
                  })
                  decorations.push(decoration)
                }

                return this.options.includeChildren
              })
            }

            return DecorationSet.create(doc, decorations)
          },
        },
      }),
    ]
  },
})
