import type { MarkdownToken } from '@tiptap/core'

import { escapeRegex } from './escapeRegex.js'

/**
 * Rejoin an inline HTML fragment that marked split into separate tokens.
 * @param tokens The inline token stream.
 * @param startIndex Index of the opening html token.
 * @param tagName The tag whose closing token to look for.
 * @param openingRaw The raw source of the opening token.
 * @returns The merged fragment and the closing token index, or null when no closing token is found.
 */
export function findSplitHtmlFragment(
  tokens: MarkdownToken[],
  startIndex: number,
  tagName: string,
  openingRaw: string,
): { mergedRaw: string; closingIndex: number } | null {
  const escapedTagName = escapeRegex(tagName)
  const closingRegex = new RegExp(`^<\\/\\s*${escapedTagName}\\b`, 'i')

  // Collect intermediate raw parts to reconstruct full HTML fragment
  const parts: string[] = [openingRaw]
  for (let j = startIndex + 1; j < tokens.length; j += 1) {
    const t = tokens[j]
    const tRaw = (t.raw ?? t.text ?? '').toString()
    parts.push(tRaw)

    if (t.type === 'html' && closingRegex.test(tRaw)) {
      return { mergedRaw: parts.join(''), closingIndex: j }
    }
  }

  return null
}
