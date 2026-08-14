import type { JSONContent, MarkdownToken } from '@tiptap/core'

import { countParagraphSeparators } from './countParagraphSeparators.js'

/**
 * Recreate empty paragraphs from the blank lines carried by a space token.
 * @param token The space token holding the blank lines.
 * @param previousNonSpaceTokenIndex Index of the previous non-space token, or -1.
 * @param nextNonSpaceTokenIndex Index of the next non-space token, or -1.
 * @returns Empty paragraph nodes, one per blank line.
 */
export function createImplicitEmptyParagraphsFromSpace(
  token: MarkdownToken,
  previousNonSpaceTokenIndex: number,
  nextNonSpaceTokenIndex: number,
): JSONContent[] {
  const separatorCount = countParagraphSeparators(token.raw || '')

  if (separatorCount === 0) {
    return []
  }

  const isBoundarySpace = previousNonSpaceTokenIndex === -1 || nextNonSpaceTokenIndex === -1
  const emptyParagraphCount = Math.max(separatorCount - (isBoundarySpace ? 0 : 1), 0)

  return Array.from({ length: emptyParagraphCount }, () => ({ type: 'paragraph', content: [] }))
}
