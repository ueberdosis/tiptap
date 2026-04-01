import type { Editor } from '@tiptap/core'

import { normalizeColor } from './normalize-color.js'

/**
 * Walk the document and normalize any non-canonical color values in textStyle
 * mark attrs.  Dispatches a single transaction (hidden from undo history)
 * when at least one attr was rewritten.
 *
 * Intended for one-time use during editor creation (`onCreate`) to normalize
 * colors loaded from JSON or HTML content.
 *
 * Returns `true` if a normalizing transaction was dispatched.
 */
export function normalizeDocColorAttrs(editor: Editor, attrName: 'color' | 'backgroundColor'): boolean {
  const { state } = editor
  let hasChanges = false
  const tr = state.tr

  state.doc.descendants((node, pos) => {
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

    const from = pos
    const to = pos + node.nodeSize

    tr.removeMark(from, to, mark)
    tr.addMark(from, to, mark.type.create({ ...mark.attrs, [attrName]: normalized }))
  })

  if (hasChanges) {
    tr.setMeta('addToHistory', false)
    editor.view.dispatch(tr)
  }

  return hasChanges
}
