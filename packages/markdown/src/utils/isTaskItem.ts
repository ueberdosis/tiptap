import type { MarkdownToken } from '@tiptap/core'

/**
 * Check if a markdown list item token is a task item and extract its state.
 *
 * @param item The list item token to check
 * @returns Object containing isTask flag, checked state, and indentation level
 *
 * @example
 * ```ts
 * isTaskItem({ raw: '- [ ] Task' }) // { isTask: true, checked: false, indentLevel: 0 }
 * isTaskItem({ raw: '  - [x] Done' }) // { isTask: true, checked: true, indentLevel: 2 }
 * isTaskItem({ raw: '- Regular' }) // { isTask: false, indentLevel: 0 }
 * ```
 */
export function isTaskItem(item: MarkdownToken): {
  isTask: boolean
  checked?: boolean
  indentLevel: number
} {
  const raw = item.raw || item.text || ''

  // Match patterns like "- [ ] " or "  - [x] "
  const match = raw.match(/^(\s*)[-+*]\s+\[([ xX])\]\s+/)

  if (match) {
    return { isTask: true, checked: match[2].toLowerCase() === 'x', indentLevel: match[1].length }
  }
  return { isTask: false, indentLevel: 0 }
}
