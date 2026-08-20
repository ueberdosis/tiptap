import { marksEqual } from '@tiptap/core'
import type { JSONContent } from '@tiptap/core'

/**
 * Merge adjacent text nodes with identical marks into a single text node.
 */
export function mergeAdjacentTextNodes(nodes: JSONContent[]): JSONContent[] {
  for (let i = nodes.length - 1; i > 0; i -= 1) {
    const current = nodes[i]
    const previous = nodes[i - 1]

    if (current.type === 'text' && previous.type === 'text') {
      const currentMarks = current.marks || []
      const previousMarks = previous.marks || []

      if (marksEqual(currentMarks, previousMarks)) {
        previous.text = (previous.text || '') + (current.text || '')
        nodes.splice(i, 1)
      }
    }
  }

  return nodes
}
