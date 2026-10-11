import type { JSONContent } from '@tiptap/core'

export function ensureLeadingParagraph(content: JSONContent[]): JSONContent[] {
  const [first, ...rest] = content

  if (!first || first.type === 'paragraph') {
    return content
  }

  // List items must start with a paragraph
  if (first.type === 'heading') {
    return [{ type: 'paragraph', content: first.content ?? [] }, ...rest]
  }

  return [{ type: 'paragraph', content: [] }, ...content]
}
