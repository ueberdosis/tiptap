import { decoration, Extension } from '@tiptap/core'
import type { DecorationDescriptor, Editor } from '@tiptap/core'
import type { EditorState } from '@tiptap/pm/state'

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
    // Scans `[from, to]` of the document and produces the highlight decorations
    // within it. `create` runs it over the whole document; `createInRange` runs
    // it over just the block(s) an edit touched (see `incrementalCreate` below).
    const scan = (editor: Editor, state: EditorState, from: number, to: number) => {
      const decorations: DecorationDescriptor[] = []
      const term = editor.storage.highlightDecorations.term.trim().toLowerCase()

      state.doc.nodesBetween(from, to, (node, pos) => {
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
          const matchFrom = pos + index
          const matchTo = matchFrom + term.length

          // inline decoration: highlight the match
          decorations.push(decoration.inline(matchFrom, matchTo, { class: 'decoration-highlight' }))

          // widget decoration: a marker rendered just before the match.
          // NOTE: The key uses the document position, which works here because
          // this widget is stateless (a simple star character). For stateful
          // widgets, always use a stable domain-based key (e.g. `comment-${id}`,
          // `paragraph-${node.attrs.id}`) so the DOM and component state are
          // preserved across edits.
          decorations.push(
            decoration.widget(
              matchFrom,
              () => {
                const marker = document.createElement('span')

                marker.className = 'decoration-marker'
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
      // Opt into incremental recomputation: on each edit only the touched
      // block(s) are rescanned via `createInRange` instead of the whole
      // document. Safe here because every decoration (a term match or a heading
      // outline) depends only on the content of its own block. The toolbar still
      // forces a full rebuild with `editor.commands.updateDecorations(...)` when
      // the search term changes.
      incrementalCreate: true,

      create: ({ editor, state }) => scan(editor, state, 0, state.doc.content.size),

      createInRange: ({ editor, state, from, to }) => scan(editor, state, from, to),
    }
  },
})
