import type { JSONContent } from '@tiptap/core'

/**
 * Type guard for parse results that apply a mark to their content.
 * @param result The parse result to check.
 * @returns True when the result is a mark result.
 */
export function isMarkResult(
  result: any,
): result is { mark: string; content: JSONContent[]; attrs?: any } {
  return result && typeof result === 'object' && 'mark' in result
}
