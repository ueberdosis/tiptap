import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from 'prosemirror-state'
import { DecorationSet, Decoration } from 'prosemirror-view'

export interface FocusOptions {
  className: string,
  start: 'deep' | 'shallow',
  levels: 'all' | number,
}

export const FocusClasses = Extension.create({
  name: 'focus',

  defaultOptions: <FocusOptions>{
    className: 'has-focus',
    start: 'deep',
    levels: 'all',
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
            if (this.options.start === 'deep') {
              doc.descendants((node, pos) => {
                if (node.isText) {
                  return
                }

                const isCurrent = anchor >= pos && anchor <= (pos + node.nodeSize)
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

              const isCurrent = anchor >= pos && anchor <= (pos + node.nodeSize)
              if (!isCurrent) {
                return false
              }

              currentLevel += 1

              const outOfScope = typeof this.options.levels === 'number'
                && (
                  (this.options.start === 'deep' && maxLevels - currentLevel > this.options.levels)
                  || (this.options.start === 'shallow' && currentLevel > this.options.levels)
                )

              if (outOfScope) {
                return this.options.start === 'deep'
              }

              decorations.push(Decoration.node(pos, pos + node.nodeSize, {
                class: this.options.className,
              }))
            })

            return DecorationSet.create(doc, decorations)
          },
        },
      }),
    ]
  },
})

declare module '@tiptap/core' {
  interface AllExtensions {
    FocusClasses: typeof FocusClasses,
  }
}
