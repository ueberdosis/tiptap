import type { ChangedRange } from '@tiptap/core'
import { combineTransactionSteps, getChangedRanges } from '@tiptap/core'
import { isHistoryTransaction } from '@tiptap/pm/history'
import type { Node as ProseMirrorNode } from '@tiptap/pm/model'
import type { EditorState, Transaction } from '@tiptap/pm/state'
import { AttrStep, ReplaceAroundStep } from '@tiptap/pm/transform'
import type { Mapping, Step } from '@tiptap/pm/transform'

const orderedListName = 'orderedList'
const defaultListStart = 1

type OrderedListAnchor = {
  position: number
  index: number
  node: ProseMirrorNode
  direct: boolean
}

type PreviousList = {
  node: ProseMirrorNode
  position: number
  firstIndex: number
}

export function continueSplitNumbering(
  transactions: readonly Transaction[],
  oldState: EditorState,
  newState: EditorState,
): Transaction | null {
  if (ignoreTransactions(transactions) || oldState.doc.eq(newState.doc)) {
    return null
  }

  const transform = combineTransactionSteps(oldState.doc, [...transactions])
  const positions = orderedListsInRanges(newState.doc, getChangedRanges(transform))

  if (positions.length === 0) {
    return null
  }

  const inverted = transform.mapping.invert()
  const explicitOrderedLists = explicitOrderedListPositions(transactions)
  const updates: { position: number; start: number }[] = []
  const starts = new Map<number, number>()

  positions.sort((left, right) => left - right)
  positions.forEach(position => {
    // A start of 1 set in this transaction is intentional, not the copied default.
    if (explicitOrderedLists.has(position)) {
      return
    }

    const node = newState.doc.nodeAt(position)

    if (!node) {
      return
    }

    const start = trailingListStart(node, position, newState.doc, oldState.doc, inverted, starts)

    if (start == null) {
      return
    }

    starts.set(position, start)
    updates.push({ position, start })
  })

  if (updates.length === 0) {
    return null
  }

  const transaction = newState.tr

  updates
    .sort((left, right) => right.position - left.position)
    .forEach(update => {
      const mapped = transaction.mapping.map(update.position)
      const node = transaction.doc.nodeAt(mapped)

      if (!node || node.attrs.start === update.start) {
        return
      }

      transaction.setNodeMarkup(mapped, undefined, {
        ...node.attrs,
        start: update.start,
      })
    })

  return transaction.steps.length > 0 ? transaction : null
}

function explicitOrderedListPositions(transactions: readonly Transaction[]): Set<number> {
  const positions = new Set<number>()

  transactions.forEach((transaction, transactionIndex) => {
    // Plugin appends, such as id rewrites, are not the caller's numbering choice.
    if (transaction.getMeta('appendedTransaction')) {
      return
    }

    transaction.steps.forEach((step, stepIndex) => {
      const doc = transaction.docs[stepIndex]
      const position = doc ? explicitOrderedListPosition(step, doc) : null

      if (position == null) {
        return
      }

      positions.add(mapToFinalPosition(position, transactions, transactionIndex, stepIndex))
    })
  })

  return positions
}

// setNodeMarkup rewraps the ordered list and keeps its content in the gap. Splits do not.
function explicitOrderedListPosition(step: Step, doc: ProseMirrorNode): number | null {
  if (step instanceof AttrStep) {
    if (step.attr !== 'start' || doc.nodeAt(step.pos)?.type.name !== orderedListName) {
      return null
    }

    return step.pos
  }

  if (!(step instanceof ReplaceAroundStep) || !rewritesOrderedList(step, doc)) {
    return null
  }

  return step.from
}

function rewritesOrderedList(step: ReplaceAroundStep, doc: ProseMirrorNode): boolean {
  const wrapper = step.slice.content.firstChild

  return (
    wrapsWholeNode(step) &&
    wrapper?.type.name === orderedListName &&
    wrapper.content.size === 0 &&
    doc.nodeAt(step.from)?.type.name === orderedListName
  )
}

function wrapsWholeNode(step: ReplaceAroundStep): boolean {
  const { slice } = step

  return (
    step.insert === 1 &&
    step.gapFrom === step.from + 1 &&
    step.gapTo === step.to - 1 &&
    slice.openStart + slice.openEnd === 0 &&
    slice.content.childCount === 1
  )
}

function mapToFinalPosition(
  position: number,
  transactions: readonly Transaction[],
  transactionIndex: number,
  stepIndex: number,
): number {
  let mapped = transactions[transactionIndex].mapping.slice(stepIndex + 1).map(position, 1)

  for (let index = transactionIndex + 1; index < transactions.length; index += 1) {
    mapped = transactions[index].mapping.map(mapped, 1)
  }

  return mapped
}

function ignoreTransactions(transactions: readonly Transaction[]): boolean {
  const documentChanged = transactions.some(transaction => transaction.docChanged)

  if (!documentChanged) {
    return true
  }

  return transactions.some(
    transaction =>
      isHistoryTransaction(transaction) ||
      transaction.getMeta('y-sync$') ||
      transaction.getMeta('addToHistory') === false,
  )
}

function orderedListsInRanges(doc: ProseMirrorNode, changes: ChangedRange[]): number[] {
  const positions = new Set<number>()

  changes.forEach(change => {
    const from = clamp(change.newRange.from, doc.content.size)
    const to = clamp(change.newRange.to, doc.content.size)

    if (from > to) {
      return
    }

    doc.nodesBetween(from, to, (node, position) => {
      if (node.type.name === orderedListName) {
        positions.add(position)
      }
    })
  })

  return [...positions]
}

function trailingListStart(
  node: ProseMirrorNode,
  position: number,
  doc: ProseMirrorNode,
  oldDoc: ProseMirrorNode,
  inverted: Mapping,
  starts: Map<number, number>,
): number | null {
  const source = sourceAnchor(node, position, oldDoc, inverted)

  if (!source) {
    return null
  }

  const currentStart = readStart(node)
  const sourceStart = readStart(source.node)

  // A start other than the one copied from the original list was set on purpose.
  if (keptOwnStart(currentStart, sourceStart)) {
    return null
  }

  const previous = previousSplitList(node, position, doc, oldDoc, inverted, source.position)

  if (!previous || source.index <= previous.firstIndex) {
    return null
  }

  const lastIndex = lastItemIndex(previous, oldDoc, inverted, source.position)

  if (lastIndex == null || source.index <= lastIndex) {
    return null
  }

  // Count items in the new document so edits made before the split are included.
  const previousStart = starts.get(previous.position) ?? readStart(previous.node)
  const start = previousStart + previous.node.childCount + (source.index - lastIndex - 1)

  return start === currentStart ? null : start
}

function keptOwnStart(currentStart: number, sourceStart: number): boolean {
  return currentStart !== sourceStart && currentStart !== defaultListStart
}

function sourceAnchor(
  node: ProseMirrorNode,
  position: number,
  oldDoc: ProseMirrorNode,
  inverted: Mapping,
): OrderedListAnchor | null {
  const sourcePosition = mapInside(node, position, inverted, oldDoc.content.size)

  if (sourcePosition == null) {
    return null
  }

  return orderedListAnchor(oldDoc, sourcePosition)
}

function previousSplitList(
  node: ProseMirrorNode,
  position: number,
  doc: ProseMirrorNode,
  oldDoc: ProseMirrorNode,
  inverted: Mapping,
  sourcePosition: number,
): PreviousList | null {
  const resolved = doc.resolve(position)
  let siblingEnd = position

  for (let siblingIndex = resolved.index() - 1; siblingIndex >= 0; siblingIndex -= 1) {
    const sibling = resolved.parent.child(siblingIndex)
    const siblingPosition = siblingEnd - sibling.nodeSize

    siblingEnd = siblingPosition

    const anchor = splitAnchor(sibling, siblingPosition, oldDoc, inverted, sourcePosition)

    if (!anchor) {
      return null
    }

    if (!isDirectOrderedList(sibling, anchor)) {
      continue
    }

    if (!sameMarkerType(sibling, node)) {
      return null
    }

    return { node: sibling, position: siblingPosition, firstIndex: anchor.index }
  }

  return null
}

function lastItemIndex(
  previous: PreviousList,
  oldDoc: ProseMirrorNode,
  inverted: Mapping,
  sourcePosition: number,
): number | null {
  const lastItem = previous.node.lastChild

  if (!lastItem) {
    return null
  }

  const itemPosition = previous.position + previous.node.nodeSize - 1 - lastItem.nodeSize
  const mapped = mapInside(lastItem, itemPosition, inverted, oldDoc.content.size)

  if (mapped == null) {
    return null
  }

  return orderedListAnchor(oldDoc, mapped, sourcePosition)?.index ?? null
}

function splitAnchor(
  sibling: ProseMirrorNode,
  siblingPosition: number,
  oldDoc: ProseMirrorNode,
  inverted: Mapping,
  sourcePosition: number,
): OrderedListAnchor | null {
  const mapped = mapInside(sibling, siblingPosition, inverted, oldDoc.content.size)

  if (mapped == null) {
    return null
  }

  // Same ordered list as before this transaction, so this is a split rather than a new list.
  return orderedListAnchor(oldDoc, mapped, sourcePosition)
}

function isDirectOrderedList(node: ProseMirrorNode, anchor: OrderedListAnchor): boolean {
  return node.type.name === orderedListName && anchor.direct
}

function orderedListAnchor(
  doc: ProseMirrorNode,
  position: number,
  expectedPosition?: number,
): OrderedListAnchor | null {
  const resolved = doc.resolve(clamp(position, doc.content.size))
  let nestedList = false

  for (let depth = resolved.depth; depth > 0; depth -= 1) {
    const node = resolved.node(depth)

    if (node.type.name !== orderedListName) {
      continue
    }

    const listPosition = resolved.before(depth)

    if (expectedPosition == null || listPosition === expectedPosition) {
      return {
        position: listPosition,
        index: resolved.index(depth),
        node,
        direct: !nestedList,
      }
    }

    nestedList = true
  }

  return null
}

function mapInside(
  node: ProseMirrorNode,
  position: number,
  inverted: Mapping,
  oldSize: number,
): number | null {
  let inside = position + 1
  let current = node

  while (current.firstChild?.isBlock && !current.isTextblock) {
    current = current.firstChild
    inside += 1
  }

  inside = Math.min(inside, position + node.nodeSize - 1)

  const forward = inverted.mapResult(inside, 1)
  const backward = inverted.mapResult(inside, -1)
  const mapped = forward.deleted && !backward.deleted ? backward.pos : forward.pos

  if (mapped < 0 || mapped > oldSize) {
    return null
  }

  return mapped
}

function readStart(node: ProseMirrorNode): number {
  const start = node.attrs.start

  return typeof start === 'number' ? start : defaultListStart
}

function sameMarkerType(left: ProseMirrorNode, right: ProseMirrorNode): boolean {
  return markerType(left) === markerType(right)
}

function markerType(node: ProseMirrorNode): string | null {
  const type = node.attrs.type

  if (typeof type !== 'string' || type === '1') {
    return null
  }

  return type
}

function clamp(position: number, size: number): number {
  return Math.max(0, Math.min(position, size))
}
