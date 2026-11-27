import type { Node as ProseMirrorNode } from '@tiptap/pm/model'
import { Mark } from '@tiptap/pm/model'
import type { EditorState, Transaction } from '@tiptap/pm/state'
import { Plugin, PluginKey } from '@tiptap/pm/state'

import { findRestoredLength, findRewrittenEnd, findRewrittenStart } from './rewrittenText.js'

interface MarkBoundary {
  marks: readonly Mark[]
  from: number
  deletedOffset: number
  /** Text that a composition deleted before the boundary, in case the keyboard inserts it again. */
  deletedText: string
  /** Formatting of existing text after the caret, which stays at the end of rewritten text. */
  afterCaret: boolean
}

type BoundaryPosition = Pick<MarkBoundary, 'from' | 'deletedOffset' | 'deletedText'>

type CaretSuffixPosition = Pick<MarkBoundary, 'from' | 'deletedText'>

type PendingMarks = readonly MarkBoundary[]

const pluginKey = new PluginKey<PendingMarks | null>('androidStoredMarks')

/** Places a boundary inside text that the keyboard rewrote or inserted again after deleting it. */
function findRewrittenOffset(oldText: string, newText: string, restoring: boolean): number | null {
  return restoring ? findRestoredLength(oldText, newText) : findRewrittenEnd(oldText, newText)
}

function textAfter(transaction: Transaction, index: number, from: number, to: number): string {
  return (transaction.docs[index + 1] ?? transaction.doc).textBetween(from, to)
}

/** Keeps the rest of a deleted word while the keyboard inserts only its beginning again. */
function keepRestoring(
  deletedText: string,
  insertedText: string,
  newStart: number,
  restored: number | null,
): BoundaryPosition | null {
  if (restored !== insertedText.length || restored >= deletedText.length) {
    return null
  }

  return {
    from: newStart + restored,
    deletedOffset: deletedText.length - restored,
    deletedText: deletedText.slice(restored),
  }
}

/** Moves a boundary through text that a composition replaced, deleted or inserted again. */
function placeBoundary(
  transaction: Transaction,
  index: number,
  boundary: BoundaryPosition,
  range: { oldStart: number; newStart: number; available: number },
): BoundaryPosition {
  const oldText =
    transaction.docs[index].textBetween(range.oldStart, boundary.from) + boundary.deletedText
  const offset = boundary.from - range.oldStart + boundary.deletedOffset

  // Only a fully deleted composition is inserted again by the keyboard
  if (!range.available) {
    return { from: range.newStart, deletedOffset: offset, deletedText: oldText }
  }

  const newText = textAfter(transaction, index, range.newStart, range.newStart + range.available)
  const restoring = boundary.deletedOffset > 0
  // Positions only match characters in plain text
  const isPlainText = oldText.length === offset && newText.length === range.available
  const rewritten = isPlainText ? findRewrittenOffset(oldText, newText, restoring) : null
  const partlyRestored = restoring
    ? keepRestoring(oldText, newText, range.newStart, rewritten)
    : null

  return (
    partlyRestored ?? {
      from: range.newStart + (rewritten ?? Math.min(offset, range.available)),
      deletedOffset: 0,
      deletedText: '',
    }
  )
}

function mapBoundary(pending: MarkBoundary, transaction: Transaction): MarkBoundary {
  let position: BoundaryPosition = pending

  for (const [index, map] of transaction.mapping.maps.entries()) {
    const { from, deletedOffset } = position
    let next: BoundaryPosition = { ...position, from: map.map(from, -1) }
    const caret = transaction.mapping.maps
      .slice(index + 1)
      .reduceRight(
        (caretPosition, nextMap) => nextMap.invert().map(caretPosition),
        transaction.selection.from,
      )

    map.forEach((oldStart, oldEnd, newStart, newEnd) => {
      const compositionEnd = Math.max(oldEnd, map.invert().map(caret))
      const containsBoundary = oldStart < oldEnd && from > oldStart && from <= compositionEnd
      const restoresBoundary = deletedOffset > 0 && from === oldStart

      if (containsBoundary || restoresBoundary) {
        const available = Math.max(newEnd, caret) - newStart

        next = placeBoundary(transaction, index, position, { oldStart, newStart, available })
      }
    })
    position = next
  }

  return { ...pending, ...position }
}

/** Moves formatting after the caret through text that a composition replaced, deleted or inserted again. */
function placeBoundaryAfterCaret(
  transaction: Transaction,
  index: number,
  boundary: CaretSuffixPosition,
  range: { oldEnd: number; newStart: number; newEnd: number },
): CaretSuffixPosition {
  const keptText = transaction.docs[index].textBetween(boundary.from, range.oldEnd)
  const oldText = boundary.deletedText + keptText
  const newText = textAfter(transaction, index, range.newStart, range.newEnd)

  // Remember the deleted text until the keyboard inserts it again
  if (!newText) {
    return { from: range.newStart, deletedText: oldText }
  }

  // Positions only match characters in plain text
  const isPlainText =
    keptText.length === range.oldEnd - boundary.from &&
    newText.length === range.newEnd - range.newStart
  const start = isPlainText ? findRewrittenStart(oldText, newText) : null

  if (start === null && boundary.deletedText) {
    return { from: range.newEnd, deletedText: oldText }
  }

  return {
    from: range.newStart + (start ?? Math.max(0, newText.length - oldText.length)),
    deletedText: '',
  }
}

/** Maps formatting after the caret, measuring its place in rewritten text from the end. */
function mapBoundaryAfterCaret(boundary: MarkBoundary, transaction: Transaction): MarkBoundary {
  let position: CaretSuffixPosition = boundary

  for (const [index, map] of transaction.mapping.maps.entries()) {
    const { from, deletedText } = position
    let next: CaretSuffixPosition = { ...position, from: map.map(from, 1) }

    map.forEach((oldStart, oldEnd, newStart, newEnd) => {
      const containsBoundary = from >= oldStart && from < oldEnd
      const restoresBoundary = deletedText !== '' && from === oldStart

      if (containsBoundary || restoresBoundary) {
        next = placeBoundaryAfterCaret(transaction, index, position, { oldEnd, newStart, newEnd })
      }
    })
    position = next
  }

  return { ...boundary, ...position }
}

/** Keeps every boundary at or after the previous one, so each range of marks stays valid. */
function keepBoundaryOrder(boundaries: PendingMarks): PendingMarks {
  let previous = 0

  return boundaries.map(boundary => {
    // Deleted text after the caret has no place until the keyboard inserts it again
    if (boundary.afterCaret && boundary.deletedText) {
      return boundary
    }

    const from = Math.max(boundary.from, previous - boundary.deletedOffset)

    previous = from + boundary.deletedOffset
    return { ...boundary, from }
  })
}

function createBoundary(marks: readonly Mark[], from: number, afterCaret: boolean): MarkBoundary {
  return { marks, from, deletedOffset: 0, deletedText: '', afterCaret }
}

/** Saves the formatting of the existing text between `from` and `to`. */
function captureTextBoundaries(
  doc: ProseMirrorNode,
  from: number,
  to: number,
  afterCaret: boolean,
): MarkBoundary[] {
  const boundaries: MarkBoundary[] = []

  doc.nodesBetween(from, to, (node, position) => {
    if (node.isText) {
      boundaries.push(createBoundary(node.marks, Math.max(position, from), afterCaret))
    }
  })

  return boundaries
}

function capturePendingMarks(
  transaction: Transaction,
  pending: PendingMarks | null,
): PendingMarks | null {
  if (!transaction.selection.empty || !transaction.storedMarks) {
    return null
  }

  const { $from, from } = transaction.selection
  const { doc } = transaction
  const before =
    pending?.filter(
      boundary => !boundary.afterCaret && boundary.from + boundary.deletedOffset < from,
    ) ?? captureTextBoundaries(doc, $from.start(), from, false)
  const after =
    pending?.filter(boundary => boundary.afterCaret) ??
    captureTextBoundaries(doc, from, $from.end(), true)

  return [...before, createBoundary(transaction.storedMarks, from, false), ...after]
}

function shouldClearPendingMarks(transaction: Transaction, compositionEvent: boolean): boolean {
  if (transaction.getMeta('composition')) {
    return false
  }

  return transaction.docChanged || (transaction.selectionSet && !compositionEvent)
}

function applyPendingMarks(
  transaction: Transaction,
  pending: PendingMarks | null,
  compositionEvent: boolean,
): PendingMarks | null {
  const applied = transaction.getMeta(pluginKey) as PendingMarks | null | undefined

  if (applied !== undefined) {
    return applied
  }

  if (transaction.storedMarksSet && !transaction.docChanged) {
    return capturePendingMarks(transaction, pending)
  }

  if (!pending) {
    return null
  }

  if (shouldClearPendingMarks(transaction, compositionEvent)) {
    return null
  }

  return keepBoundaryOrder(
    pending.map(boundary =>
      boundary.afterCaret
        ? mapBoundaryAfterCaret(boundary, transaction)
        : mapBoundary(boundary, transaction),
    ),
  )
}

function applyMarkBoundary(
  transaction: Transaction,
  requestedMarks: readonly Mark[],
  from: number,
  to: number,
): void {
  transaction.doc.nodesBetween(from, to, (node, position, parent) => {
    if (!node.isText || !parent) {
      return
    }

    const marks = parent.type.allowedMarks(requestedMarks)

    if (Mark.sameSet(node.marks, marks)) {
      return
    }

    const start = Math.max(position, from)
    const end = Math.min(position + node.nodeSize, to)

    transaction.removeMark(start, end)
    marks.forEach(mark => transaction.addMark(start, end, mark))
  })
}

function findCompositionRange(oldState: EditorState, newState: EditorState) {
  let from = oldState.doc.content.findDiffStart(newState.doc.content)
  const end = oldState.doc.content.findDiffEnd(newState.doc.content)

  if (from === null || !end) {
    return null
  }

  if (end.a < from && oldState.doc.content.size < newState.doc.content.size) {
    const insertedSize = end.b - end.a

    from = Math.max(end.a, Math.min(from, newState.selection.from - insertedSize))
    return { from, to: from + insertedSize }
  }

  const overlap = Math.max(0, from - Math.min(end.a, end.b))
  const to = end.b + overlap

  return {
    from,
    to:
      oldState.doc.content.size < newState.doc.content.size
        ? Math.max(to, newState.selection.from)
        : to,
  }
}

function appendPendingMarks(
  transactions: readonly Transaction[],
  oldState: EditorState,
  newState: EditorState,
): Transaction | null {
  const pending = pluginKey.getState(newState)
  const composedText = transactions.some(
    transaction => transaction.docChanged && transaction.getMeta('composition'),
  )

  if (!pending || !newState.selection.empty || !composedText) {
    return null
  }

  const range = findCompositionRange(oldState, newState)

  if (!range) {
    return null
  }

  const from = Math.max(range.from, pending[0].from + pending[0].deletedOffset)
  const { to } = range

  if (from >= to) {
    return null
  }

  const transaction = newState.tr

  pending.forEach((boundary, index) => {
    const next = pending[index + 1]
    const rangeStart = Math.max(from, boundary.from + boundary.deletedOffset)
    const rangeEnd = next ? Math.min(to, next.from + next.deletedOffset) : to

    if (rangeStart < rangeEnd) {
      applyMarkBoundary(transaction, boundary.marks, rangeStart, rangeEnd)
    }
  })
  transaction.setMeta(pluginKey, pending)
  return transaction.steps.length ? transaction : null
}

export function createAndroidStoredMarksPlugin(): Plugin<PendingMarks | null> {
  let compositionEvent = false
  let compositionTimeout: ReturnType<typeof setTimeout> | undefined
  const startCompositionEvent = () => {
    compositionEvent = true
    clearTimeout(compositionTimeout)
    compositionTimeout = setTimeout(() => {
      compositionEvent = false
    }, 0)
    return false
  }
  const clearPendingMarks = (view: { state: EditorState; dispatch: (tr: Transaction) => void }) => {
    compositionEvent = false

    if (pluginKey.getState(view.state)) {
      view.dispatch(view.state.tr.setMeta(pluginKey, null))
    }

    return false
  }

  return new Plugin<PendingMarks | null>({
    key: pluginKey,
    state: {
      init: () => null,
      apply: (transaction, pending) => applyPendingMarks(transaction, pending, compositionEvent),
    },
    props: {
      handleDOMEvents: {
        compositionstart: startCompositionEvent,
        compositionupdate: startCompositionEvent,
        compositionend: startCompositionEvent,
        blur: clearPendingMarks,
        pointerdown: clearPendingMarks,
      },
    },
    appendTransaction: appendPendingMarks,
    view: () => ({ destroy: () => clearTimeout(compositionTimeout) }),
  })
}
