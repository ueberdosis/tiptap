import { decoration, Extension } from '@tiptap/core'
import type { DecorationDescriptor } from '@tiptap/core'

export interface HighlightDecorationsOptions {
  /**
   * The term to highlight. Can be changed at runtime via storage:
   * `editor.storage.highlightDecorations.term = 'foo'`, followed by
   * `editor.commands.updateDecorations('highlightDecorations')`.
   */
  term: string
}

export interface HighlightDecorationsStorage {
  term: string
}

declare module '@tiptap/core' {
  interface Storage {
    highlightDecorations: HighlightDecorationsStorage
  }
}

/**
 * A demo extension showcasing the declarative Decorations API.
 *
 * It produces all three decoration kinds from a single `addDecorations`:
 * - `inline`  — highlights every occurrence of the search term
 * - `widget`  — a small star marker rendered before each match
 * - `node`    — outlines every heading in the document
 */
export const HighlightDecorations = Extension.create<
  HighlightDecorationsOptions,
  HighlightDecorationsStorage
>({
  name: 'highlightDecorations',

  addOptions() {
    return {
      term: 'tiptap',
    }
  },

  addStorage() {
    return {
      term: this.options.term,
    }
  },

  addDecorations() {
    return {
      // Recompute when the document changes. The term lives in storage, so the
      // toolbar forces a recompute with `editor.commands.updateDecorations(...)`
      // when it changes — this is the default behaviour, shown here explicitly.
      shouldUpdate: ({ tr }) => tr.docChanged,

      create: ({ editor, state }) => {
        const decorations: DecorationDescriptor[] = []
        const term = editor.storage.highlightDecorations.term.trim().toLowerCase()

        state.doc.descendants((node, pos) => {
          // node decoration: outline every heading
          if (node.type.name === 'heading') {
            decorations.push(
              decoration.node(pos, pos + node.nodeSize, { class: 'decoration-heading' }),
            )
          }

          if (!term || !node.isText || !node.text) {
            return
          }

          const text = node.text.toLowerCase()
          let index = text.indexOf(term)

          while (index !== -1) {
            const from = pos + index
            const to = from + term.length

            // inline decoration: highlight the match
            decorations.push(decoration.inline(from, to, { class: 'decoration-highlight' }))

            // widget decoration: a marker rendered just before the match.
            // The key is derived from the position for this demo; in real usage
            // prefer a stable, domain-specific id so the widget DOM is reused.
            decorations.push(
              decoration.widget(
                from,
                () => {
                  const marker = document.createElement('span')

                  marker.className = 'decoration-marker'
                  marker.textContent = '★'

                  return marker
                },
                { key: `highlight-marker-${from}`, side: -1 },
              ),
            )

            index = text.indexOf(term, index + term.length)
          }
        })

        return decorations
      },
    }
  },
})
