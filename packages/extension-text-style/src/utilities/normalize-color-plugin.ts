import type { EditorState, Transaction } from '@tiptap/pm/state'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import type { EditorView } from '@tiptap/pm/view'

/**
 * Creates a ProseMirror plugin that normalizes color attributes on textStyle
 * marks using the given `normalize` function.
 *
 * - **Initial content** (JSON / HTML): normalized via the plugin's `view()`
 *   hook when the editor view is first created.
 * - **Ongoing changes** (user edits, programmatic updates, Yjs syncs):
 *   normalized via `appendTransaction`, which diffs the old and new document
 *   and only walks the changed range.
 *
 * Both paths hide their fixing transactions from the undo history.
 */
export function createColorNormalizationPlugin(
  attrName: 'color' | 'backgroundColor',
  normalize: (color: string) => string,
): Plugin {
  const key = new PluginKey(`colorNormalization_${attrName}`)

  function normalizeRange(state: EditorState, from: number, to: number): Transaction | null {
    const tr = state.tr
    let hasChanges = false

    state.doc.nodesBetween(from, to, (node, pos) => {
      if (!node.isText) {
        return
      }

      const mark = node.marks.find(m => m.type.name === 'textStyle')

      if (!mark) {
        return
      }

      const value = mark.attrs[attrName]

      if (!value) {
        return
      }

      const normalized = normalize(value)

      if (normalized === value) {
        return
      }

      hasChanges = true
      tr.removeMark(pos, pos + node.nodeSize, mark)
      tr.addMark(
        pos,
        pos + node.nodeSize,
        mark.type.create({ ...mark.attrs, [attrName]: normalized }),
      )
    })

    if (!hasChanges) {
      return null
    }

    tr.setMeta('addToHistory', false)

    return tr
  }

  return new Plugin({
    key,

    // Normalize colors in the initial document when the view is created.
    view(editorView: EditorView) {
      // Dispatch asynchronously to avoid re-entrancy during view creation.
      // Read `state` inside the timeout (not at `view()` time) so the fixing
      // transaction is built against whatever state is current when it
      // actually runs, not a possibly-stale snapshot from view creation.
      // This also matters when multiple normalization plugins (e.g. `color`
      // and `backgroundColor`) each schedule their own timer: by the time the
      // second one fires, the first has already dispatched, so re-reading
      // state here avoids building a transaction against a state that's no
      // longer current.
      const timer = setTimeout(() => {
        const { state } = editorView
        const fixTr = normalizeRange(state, 0, state.doc.content.size)

        if (fixTr) {
          editorView.dispatch(fixTr)
        }
      }, 0)

      return {
        destroy() {
          clearTimeout(timer)
        },
      }
    },

    appendTransaction(transactions, oldState, newState) {
      if (!transactions.some(tr => tr.docChanged)) {
        return null
      }

      // Find the range that differs between the old and new document.
      const start = oldState.doc.content.findDiffStart(newState.doc.content)

      if (start == null) {
        return null
      }

      const endResult = oldState.doc.content.findDiffEnd(newState.doc.content)

      if (!endResult) {
        return null
      }

      // endResult.b is the end position in the *new* document.
      const from = Math.min(start, endResult.b)
      const to = Math.max(start, endResult.b)

      return normalizeRange(newState, from, to)
    },
  })
}
