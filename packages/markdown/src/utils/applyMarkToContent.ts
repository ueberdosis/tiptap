import type { JSONContent } from '@tiptap/core'

/**
 * Apply a mark to every node in the content array.
 * @param markType The mark type to apply.
 * @param content The content nodes to mark.
 * @param attrs Optional mark attributes.
 * @returns The content with the mark applied.
 */
export function applyMarkToContent(
  markType: string,
  content: JSONContent[],
  attrs?: any,
): JSONContent[] {
  return content.map(node => {
    if (node.type === 'text') {
      // Add the mark to existing marks or create new marks array
      const existingMarks = node.marks || []
      const newMark = attrs ? { type: markType, attrs } : { type: markType }

      return {
        ...node,
        marks: [...existingMarks, newMark],
      }
    }

    // For non-text nodes, recursively apply to content
    return {
      ...node,
      content: node.content ? applyMarkToContent(markType, node.content, attrs) : undefined,
    }
  })
}
