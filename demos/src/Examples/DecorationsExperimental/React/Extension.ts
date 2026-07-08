import { Extension } from '@tiptap/core'
import type { Node as ProseMirrorNode } from '@tiptap/pm/model'
import type { Selection } from '@tiptap/pm/state'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import type { Decoration as DecorationType } from '@tiptap/pm/view'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import { widget } from '@tiptap/react-experimental'

import MatchBadge from './MatchBadge.js'

export const searchHighlightKey = new PluginKey<{ term: string; decorations: DecorationSet }>(
  'searchHighlight',
)

/**
 * Inline decorations for every occurrence of the term, a React widget badge
 * after each match, and a node decoration on the block the cursor is in —
 * one demo covering all three decoration kinds.
 */
const buildDecorations = (
  doc: ProseMirrorNode,
  term: string,
  selection: Selection,
): DecorationSet => {
  const decorations: DecorationType[] = []
  const query = term.toLowerCase()
  let matchIndex = 0

  if (query) {
    doc.descendants((node, pos) => {
      if (!node.isText || !node.text) {
        return
      }
      const text = node.text.toLowerCase()
      let offset = text.indexOf(query)

      while (offset !== -1) {
        matchIndex += 1
        const from = pos + offset
        const to = from + query.length

        decorations.push(Decoration.inline(from, to, { class: 'search-hit' }))
        decorations.push(
          widget(to, MatchBadge, { side: 1, key: `match-${matchIndex}`, index: matchIndex }),
        )
        offset = text.indexOf(query, offset + query.length)
      }
    })
  }

  // The top-level block containing the cursor gets a node decoration
  if (selection.$from.depth > 0) {
    const blockPos = selection.$from.before(1)
    const block = doc.nodeAt(blockPos)

    if (block) {
      decorations.push(
        Decoration.node(blockPos, blockPos + block.nodeSize, { class: 'active-block' }),
      )
    }
  }

  return DecorationSet.create(doc, decorations)
}

export default Extension.create({
  name: 'searchHighlight',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: searchHighlightKey,
        state: {
          init: (_, state) => ({
            term: '',
            decorations: buildDecorations(state.doc, '', state.selection),
          }),
          apply: (tr, value, _oldState, newState) => {
            const term = (tr.getMeta(searchHighlightKey) as string | undefined) ?? value.term

            if (term === value.term && !tr.docChanged && !tr.selectionSet) {
              return value
            }
            return { term, decorations: buildDecorations(newState.doc, term, newState.selection) }
          },
        },
        props: {
          decorations: state => searchHighlightKey.getState(state)?.decorations,
        },
      }),
    ]
  },
})
