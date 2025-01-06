import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

export interface FocusOptions {
  /**
   * The class name that should be added to the focused node.
   * @default 'has-focus'
   * @example 'is-focused'
   */
  className: string

  /**
   * The mode by which the focused node is determined.
   * - All: All nodes are marked as focused.
   * - Deepest: Only the deepest node is marked as focused.
   * - Shallowest: Only the shallowest node is marked as focused.
   *
   * @default 'all'
   * @example 'deepest'
   * @example 'shallowest'
   */
  mode: 'all' | 'deepest' | 'shallowest'
}

/**
 * This extension allows you to add a class to the focused node.
 * @see https://www.tiptap.dev/api/extensions/focus
 */
export const Focus = Extension.create<FocusOptions>({
  name: 'focus',

  addOptions() {
    return {
      className: 'has-focus',
      mode: 'all',
    }
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

            // Maximum Levels
            let maxLevels = 0

            if (this.options.mode === 'deepest') {
              doc.descendants((node, pos) => {
                if (node.isText) {
                  return
                }

                const isCurrent = anchor >= pos && anchor <= pos + node.nodeSize - 1

                if (!isCurrent) {
                  return false
                }

                maxLevels += 1
              })
            }

            // Loop through current
            let currentLevel = 0

            doc.descendants((node, pos) => {
              if (node.isText) {
                return false
              }

              const isCurrent = anchor >= pos && anchor <= pos + node.nodeSize - 1

              if (!isCurrent) {
                return false
              }

              currentLevel += 1

              const outOfScope =
                (this.options.mode === 'deepest' && maxLevels - currentLevel > 0) ||
                (this.options.mode === 'shallowest' && currentLevel > 1)

              if (outOfScope) {
                return this.options.mode === 'deepest'
              }

              decorations.push(
                Decoration.node(pos, pos + node.nodeSize, {
                  class: this.options.className,
                }),
              )
            })

            return DecorationSet.create(doc, decorations)
          },
        },
      }),
    ]
  },
})
