import { createInlineDecoration, Extension } from '@tiptap/vue-3'

/**
 * Keyword Highlighting - Inline Decoration Example
 * Highlights important keywords in the document with customizable colors.
 * This demonstrates how inline decorations can highlight text ranges.
 */
export const KeywordHighlightingExtension = Extension.create({
  name: 'keywordHighlighting',

  addOptions() {
    return {
      // Configure keywords and their highlight classes
      keywords: [
        { word: 'important', class: 'highlight-important' },
        { word: 'todo', class: 'highlight-todo' },
        { word: 'note', class: 'highlight-note' },
        { word: 'warning', class: 'highlight-warning' },
      ],
    }
  },

  decorations: ({ editor }) => {
    return {
      create({ state }) {
        const decorations = []
        const keywords =
          editor.extensionManager.extensions.find(ext => ext.name === 'keywordHighlighting')?.options?.keywords || []

        state.doc.descendants((node, pos) => {
          if (!node.isText) {
            return
          }

          const text = node.text.toLowerCase()

          keywords.forEach(({ word, class: highlightClass }) => {
            let searchPos = 0
            let index = text.indexOf(word.toLowerCase(), searchPos)
            while (index !== -1) {
              decorations.push(
                createInlineDecoration(pos + index, pos + index + word.length, { class: highlightClass }),
              )

              searchPos = index + word.length
              index = text.indexOf(word.toLowerCase(), searchPos)
            }
          })
        })

        return decorations
      },

      shouldUpdate: ({ tr }) => {
        return tr.docChanged
      },
    }
  },
})
