import type { JSONContent, MarkdownParseResult } from '@tiptap/core'

import { isMarkResult } from './isMarkResult.js'

/**
 * Normalize a parse handler result into plain JSON content, unwrapping mark results.
 * @param result The parse handler result.
 * @returns The JSON content, or null when the result was empty.
 */
export function normalizeParseResult(
  result: MarkdownParseResult | null,
): JSONContent | JSONContent[] | null {
  if (!result) {
    return null
  }

  if (isMarkResult(result)) {
    // This shouldn't happen at the top level, but handle it gracefully
    return result.content
  }

  return result as JSONContent | JSONContent[]
}
