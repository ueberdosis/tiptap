import type { Range } from '@tiptap/core'
import { getMarksBetween } from '@tiptap/core'
import type { MarkType } from '@tiptap/pm/model'
import type { Transaction } from '@tiptap/pm/state'

import { UNICODE_WHITESPACE_REGEX_TRAILING } from './whitespace.js'

export function unlinkTrailingWhitespace(tr: Transaction, range: Range, type: MarkType) {
  const rangeEnd = tr.doc.resolve(range.to)

  if (!rangeEnd.nodeBefore?.isText) {
    return
  }

  // Keep inline atoms from being mistaken for whitespace.
  const insertedText = tr.doc.textBetween(range.from, range.to, '\uFFFC', '\uFFFC')
  const trailingWhitespace = insertedText.match(UNICODE_WHITESPACE_REGEX_TRAILING)?.[0]

  if (!trailingWhitespace) {
    return
  }

  const whitespaceFrom = range.to - trailingWhitespace.length
  const linkMarks = getMarksBetween(whitespaceFrom, range.to, tr.doc).filter(
    item => item.mark.type === type,
  )

  if (!linkMarks.length) {
    return
  }

  const { nodeAfter } = rangeEnd
  const linkContinues = !!nodeAfter && linkMarks.some(item => item.mark.isInSet(nodeAfter.marks))

  if (linkContinues) {
    return
  }

  const storedMarks = tr.storedMarks
  tr.removeMark(whitespaceFrom, range.to, type)
  tr.setStoredMarks(storedMarks)

  if (tr.selection.empty && tr.selection.from === range.to) {
    tr.removeStoredMark(type)
  }
}
