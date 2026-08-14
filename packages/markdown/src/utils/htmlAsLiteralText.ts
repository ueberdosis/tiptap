import type { JSONContent } from '@tiptap/core'

/**
 * Build a JSON node that preserves raw HTML as literal text.
 * @param html The HTML to keep verbatim.
 * @param isBlock Whether to wrap the text in a paragraph node.
 * @returns A paragraph or text node, or null when there is nothing to keep.
 */
export function htmlAsLiteralText(
  html: string,
  isBlock: boolean,
): JSONContent | JSONContent[] | null {
  // Strip trailing whitespace/newlines that marked appends to block HTML
  // tokens, keeping inline text verbatim so separator spaces survive.
  const text = isBlock ? html.replace(/\s+$/, '') : html

  if (!text) {
    return null
  }

  if (isBlock) {
    return {
      type: 'paragraph',
      content: [{ type: 'text', text }],
    }
  }

  return { type: 'text', text }
}
