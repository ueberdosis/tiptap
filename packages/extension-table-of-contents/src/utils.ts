import type { GetTableOfContentIndexFunction, GetTableOfContentLevelFunction, TableOfContentDataItem } from './types.js'

export const getLastHeadingOnLevel = (
  headings: TableOfContentDataItem[],
  level: number,
): TableOfContentDataItem | undefined => {
  let heading = headings.filter(currentHeading => currentHeading.level === level).pop()

  if (level === 0) {
    return undefined
  }

  if (!heading) {
    heading = getLastHeadingOnLevel(headings, level - 1)
  }

  return heading
}

export const getHeadlineLevel: GetTableOfContentLevelFunction = (headline, previousItems) => {
  let level = 1

  const previousHeadline = previousItems.at(-1)
  const highestHeadlineAbove = [...previousItems].reverse().find(h => h.originalLevel <= headline.node.attrs.level)

  const highestLevelAbove = highestHeadlineAbove?.level || 1

  if (headline.node.attrs.level > (previousHeadline?.originalLevel || 1)) {
    level = (previousHeadline?.level || 1) + 1
  } else if (headline.node.attrs.level < (previousHeadline?.originalLevel || 1)) {
    level = highestLevelAbove
  } else {
    level = previousHeadline?.level || 1
  }

  return level
}

export const getLinearIndexes: GetTableOfContentIndexFunction = (_headline, previousHeadlines) => {
  const previousHeadline = previousHeadlines.at(-1)

  if (!previousHeadline) {
    return 1
  }

  return (previousHeadline?.itemIndex || 1) + 1
}

export const getHierarchicalIndexes: GetTableOfContentIndexFunction = (headline, previousHeadlines, currentLevel) => {
  const level = currentLevel || headline.node.attrs.level || 1
  let itemIndex = 1

  const previousHeadlinesOnLevelOrBelow = previousHeadlines.filter(h => h.level <= level)

  if (previousHeadlinesOnLevelOrBelow.at(-1)?.level === level) {
    itemIndex = (previousHeadlinesOnLevelOrBelow.at(-1)?.itemIndex || 1) + 1
  } else {
    itemIndex = 1
  }

  return itemIndex
}

export function debounce(func: (...args: any[]) => void, wait: number) {
  let timeout: ReturnType<typeof setTimeout> | null = null

  return (...args: any[]) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}
