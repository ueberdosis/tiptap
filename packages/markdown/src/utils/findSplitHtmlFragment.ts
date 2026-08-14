import type { MarkdownToken } from '@tiptap/core'

import { escapeRegex } from './escapeRegex.js'

/** Get the raw string representation of a Markdown token. */
function getTokenRaw(token: MarkdownToken): string {
  return (token.raw ?? token.text ?? '').toString()
}

/**
 * Get the nesting delta of a same-name tag in a raw HTML fragment.
 *
 * The delta is -1 for a closing tag, +1 for an opening tag, and 0 otherwise.
 * @param raw The raw HTML fragment.
 * @param closingRegex The regex to match the closing tag.
 * @param openingRegex The regex to match the opening tag.
 * @returns The nesting delta: -1 for a closing tag, +1 for an opening tag, 0 otherwise.
 */
function getSameTagNestingDelta(raw: string, closingRegex: RegExp, openingRegex: RegExp): number {
  if (closingRegex.test(raw)) {
    return -1
  }

  if (openingRegex.test(raw) && !raw.trim().endsWith('/>')) {
    return 1
  }

  return 0
}

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
  const openingRegex = new RegExp(`^<\\s*${escapedTagName}\\b`, 'i')

  // Collect intermediate raw parts to reconstruct full HTML fragment
  const parts: string[] = [openingRaw]
  let nestedDepth = 0

  for (let j = startIndex + 1; j < tokens.length; j += 1) {
    const t = tokens[j]
    const tRaw = getTokenRaw(t)
    parts.push(tRaw)

    if (t.type !== 'html') {
      continue
    }

    nestedDepth += getSameTagNestingDelta(tRaw, closingRegex, openingRegex)

    // Depth -1 means the matching outer tag was closed
    if (nestedDepth === -1) {
      return { mergedRaw: parts.join(''), closingIndex: j }
    }
  }

  return null
}
