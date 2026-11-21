import type { JSONContent } from '@tiptap/core'

export function hasEmptyLeadingParagraph(node: JSONContent): boolean {
  const first = node.content?.[0]

  return first?.type === 'paragraph' && !first.content?.length
}
