import type { JSONContent } from '@tiptap/core'

export function ensureLeadingParagraph(content: JSONContent[]): JSONContent[] {
  if (!content[0] || content[0].type === 'paragraph') {
    return content
  }

  // List items must start with a paragraph
  return [{ type: 'paragraph', content: [] }, ...content]
}
