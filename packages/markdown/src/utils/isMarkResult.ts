import type { JSONContent } from '@tiptap/core'

/**
 * Type guard for parse results that apply a mark to their content.
 * @param result The parse result to check.
 * @returns True when the result is a mark result.
 */
export function isMarkResult(
  result: unknown,
): result is { mark: string; content: JSONContent[]; attrs?: Record<string, any> } {
  if (!result || typeof result !== 'object' || Array.isArray(result)) {
    return false
  }

  const candidate = result as { mark?: unknown; content?: unknown; attrs?: unknown }

  if (typeof candidate.mark !== 'string' || !Array.isArray(candidate.content)) {
    return false
  }

  if (candidate.attrs !== undefined) {
    if (
      candidate.attrs === null ||
      typeof candidate.attrs !== 'object' ||
      Array.isArray(candidate.attrs)
    ) {
      return false
    }
  }

  return true
}
