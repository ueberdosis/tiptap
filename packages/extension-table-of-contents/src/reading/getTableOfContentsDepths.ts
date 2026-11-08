/**
 * Turns heading levels into outline depths. The shallowest level gets depth `1`,
 * and skipped levels do not add extra indentation.
 * @param levels The heading levels in document order.
 * @returns One depth per level, starting at `1`.
 * @example getTableOfContentsDepths([2, 4, 3, 2]) // [1, 2, 2, 1]
 */
export function getTableOfContentsDepths(levels: number[]): number[] {
  const openLevels: number[] = []

  return levels.map(level => {
    while (openLevels.length > 0 && openLevels[openLevels.length - 1] >= level) {
      openLevels.pop()
    }

    openLevels.push(level)

    return openLevels.length
  })
}
