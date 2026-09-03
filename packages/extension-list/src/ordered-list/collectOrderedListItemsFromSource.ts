import type { OrderedListItem } from './utils.js'
import { collectOrderedListItems, ORDERED_LIST_ITEM_REGEX } from './utils.js'

const ORDERED_LIST_SCAN_WINDOW = 64

// Splits at most `max` lines. A shorter result means `source` ended.
function takeLines(source: string, max: number): string[] {
  const lines: string[] = []
  let start = 0

  while (lines.length < max) {
    const lineEnd = source.indexOf('\n', start)

    if (lineEnd === -1) {
      lines.push(source.slice(start))
      return lines
    }

    lines.push(source.slice(start, lineEnd))
    start = lineEnd + 1
  }

  return lines
}

/**
 * Collect ordered list items from the start of `source`, reading only the lines the list needs.
 *
 * @param source Markdown beginning at a block boundary.
 * @returns The items, how many lines they consumed, and the lines that were read.
 * @example
 *   collectOrderedListItemsFromSource('1. one\n2. two\n\nAfter')
 *   // → [[item, item], 3, ['1. one', '2. two', '', 'After']]
 */
export function collectOrderedListItemsFromSource(
  source: string,
): [OrderedListItem[], number, string[]] {
  const firstLineEnd = source.indexOf('\n')
  const firstLine = firstLineEnd === -1 ? source : source.slice(0, firstLineEnd)

  // Every block start is offered here, so reject non-lists before reading further.
  if (!ORDERED_LIST_ITEM_REGEX.test(firstLine)) {
    return [[], 0, []]
  }

  let windowSize = ORDERED_LIST_SCAN_WINDOW
  let lines = takeLines(source, windowSize)
  let collected = collectOrderedListItems(lines)

  // Consuming the whole window means the list may continue past it.
  while (collected[1] === lines.length && lines.length === windowSize) {
    windowSize *= 2
    lines = takeLines(source, windowSize)
    collected = collectOrderedListItems(lines)
  }

  return [collected[0], collected[1], lines]
}
