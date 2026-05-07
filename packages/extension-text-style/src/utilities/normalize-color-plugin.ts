import type { EditorState, Transaction } from '@tiptap/pm/state'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import type { EditorView } from '@tiptap/pm/view'

import { normalizeColor } from './normalize-color.js'

/**
 * Creates a ProseMirror plugin that normalizes color attributes on textStyle
 * marks.
 *
 * - **Initial content** (JSON / HTML): normalized via the plugin's `view()`
 *   hook when the editor view is first created.
 * - **Ongoing changes** (user edits, programmatic updates, Yjs syncs):
 *   normalized via `appendTransaction`, which diffs the old and new document
 *   and only walks the changed range.
 *
 * Both paths hide their fixing transactions from the undo history.
 */
export function createColorNormalizationPlugin(attrName: 'color' | 'backgroundColor'): Plugin {
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

      const normalized = normalizeColor(value)

      if (normalized === value) {
        return
      }

      hasChanges = true
      tr.removeMark(pos, pos + node.nodeSize, mark)
      tr.addMark(pos, pos + node.nodeSize, mark.type.create({ ...mark.attrs, [attrName]: normalized }))
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
      const fixTr = normalizeRange(editorView.state, 0, editorView.state.doc.content.size)

      if (fixTr) {
        // Dispatch asynchronously to avoid re-entrancy during view creation.
        setTimeout(() => editorView.dispatch(fixTr), 0)
      }

      return {}
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
