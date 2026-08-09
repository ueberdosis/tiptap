import { Decoration, Extension } from '@tiptap/core'
import type { Editor } from '@tiptap/core'
import type { EditorState } from '@tiptap/pm/state'

export interface HighlightDecorationsOptions {
  /** The term to highlight. Change at runtime via `editor.storage.highlightDecorations.term`. */
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

/** Demo extension showing inline, widget, and node decorations. */
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
    // Scans [from, to] and returns decorations. `create` scans the whole doc,
    // `createInRange` scans only the edited blocks.
    const scan = (editor: Editor, state: EditorState, from: number, to: number) => {
      const decorations: Decoration[] = []
      const term = editor.storage.highlightDecorations.term.trim().toLowerCase()

      state.doc.nodesBetween(from, to, (node, pos) => {
        // node decoration: outline headings
        if (node.type.name === 'heading') {
          decorations.push(
            Decoration.Node(pos, pos + node.nodeSize, { class: 'decoration-heading' }),
          )
        }

        if (!term || !node.isText || !node.text) {
          return
        }

        const text = node.text.toLowerCase()
        let index = text.indexOf(term)

        while (index !== -1) {
          const matchFrom = pos + index
          const matchTo = matchFrom + term.length

          // inline decoration: highlight the match
          decorations.push(Decoration.Inline(matchFrom, matchTo, { class: 'decoration-highlight' }))

          // widget decoration: a star marker before each match.
          // Position-based key is fine here because the widget is stateless.
          // For stateful widgets, use a stable domain key like `comment-${id}`.
          decorations.push(
            Decoration.Widget(
              matchFrom,
              () => {
                const marker = document.createElement('span')

                marker.className = 'decoration-marker'
                marker.ariaHidden = 'true'
                marker.textContent = '★'

                return marker
              },
              { key: `highlight-marker-${matchFrom}`, side: -1 },
            ),
          )

          index = text.indexOf(term, index + term.length)
        }
      })

      return decorations
    }

    return {
      // Only rescan changed blocks on edits; force full rebuild on term change.
      update: 'changedRanges',

      create: ({ editor, state }) => scan(editor, state, 0, state.doc.content.size),

      createInRange: ({ editor, state, from, to }) => scan(editor, state, from, to),
    }
  },
})
