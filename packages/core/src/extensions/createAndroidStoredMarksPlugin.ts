import { Mark } from '@tiptap/pm/model'
import type { EditorState, Transaction } from '@tiptap/pm/state'
import { Plugin, PluginKey } from '@tiptap/pm/state'

interface MarkBoundary {
  marks: readonly Mark[]
  from: number
  deletedOffset: number
}

type PendingMarks = readonly MarkBoundary[]

const pluginKey = new PluginKey<PendingMarks | null>('androidStoredMarks')

function mapBoundary(pending: MarkBoundary, transaction: Transaction): MarkBoundary {
  let { from, deletedOffset } = pending

  for (const [index, map] of transaction.mapping.maps.entries()) {
    let nextFrom = map.map(from, -1)
    const caret = transaction.mapping.maps
      .slice(index + 1)
      .reduceRight(
        (position, nextMap) => nextMap.invert().map(position),
        transaction.selection.from,
      )

    map.forEach((oldStart, oldEnd, newStart, newEnd) => {
      const compositionEnd = Math.max(oldEnd, map.invert().map(caret))
      const containsBoundary = oldStart < oldEnd && from > oldStart && from <= compositionEnd
      const restoresBoundary = deletedOffset > 0 && from === oldStart

      if (containsBoundary || restoresBoundary) {
        const offset = from - oldStart + deletedOffset
        const available = Math.max(newEnd, caret) - newStart

        nextFrom = newStart + Math.min(offset, available)
        // Only a fully deleted composition is inserted again by the keyboard
        deletedOffset = available ? 0 : offset
      }
    })
    from = nextFrom
  }

  return { ...pending, from, deletedOffset }
}

function capturePendingMarks(
  transaction: Transaction,
  pending: PendingMarks | null,
): PendingMarks | null {
  if (!transaction.selection.empty || !transaction.storedMarks) {
    return null
  }

  const from = transaction.selection.from
  const earlier = pending?.filter(boundary => boundary.from + boundary.deletedOffset < from) ?? []

  if (!pending) {
    const { $from } = transaction.selection

    transaction.doc.nodesBetween($from.start(), from, (node, position) => {
      if (node.isText) {
        earlier.push({ marks: node.marks, from: position, deletedOffset: 0 })
      }
    })
  }

  return [...earlier, { marks: transaction.storedMarks, from, deletedOffset: 0 }]
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

  return pending.map(boundary => mapBoundary(boundary, transaction))
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
