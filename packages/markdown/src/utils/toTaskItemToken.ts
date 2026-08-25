import type { MarkdownToken } from '@tiptap/core'
import type { Token } from 'marked'

import { isTaskItem } from './isTaskItem.js'

export type TaskListItemToken = MarkdownToken & {
  type: 'taskItem'
  checked?: boolean
  indentLevel?: number
}

/**
 * Transform a task list item token, extracting main and nested content.
 */
export function toTaskItemToken(
  item: MarkdownToken,
  tokenizeBlock: (src: string) => Token[],
  tokenizeInline: (src: string) => MarkdownToken[],
): TaskListItemToken {
  const { checked, indentLevel } = isTaskItem(item)

  // Split raw content by lines to separate main content from nested
  const raw = item.raw || item.text || ''
  const lines = raw.split('\n')

  // Extract main content from the first line
  const firstLineMatch = lines[0].match(/^\s*[-+*]\s+\[([ xX])\]\s+(.*)$/)
  const mainContent = firstLineMatch ? firstLineMatch[2] : ''

  // Parse nested content from remaining lines
  let nestedTokens: MarkdownToken[] = []
  if (lines.length > 1) {
    // Join all lines after the first
    const nestedRaw = lines.slice(1).join('\n')

    // Only parse if there's actual content
    if (nestedRaw.trim()) {
      // Find minimum indentation of non-empty lines
      const nestedLines = lines.slice(1)
      const nonEmptyLines = nestedLines.filter(line => line.trim())
      if (nonEmptyLines.length > 0) {
        const minIndent = Math.min(
          ...nonEmptyLines.map(line => line.length - line.trimStart().length),
        )
        // Remove common indentation while preserving structure
        const trimmedLines = nestedLines.map(line => {
          if (!line.trim()) {
            return '' // Keep empty lines
          }
          return line.slice(minIndent)
        })
        const nestedContent = trimmedLines.join('\n').trim()
        // Use the lexer to parse nested content
        if (nestedContent) {
          nestedTokens = tokenizeBlock(`${nestedContent}\n`)
        }
      }
    }
  }

  return {
    type: 'taskItem',
    raw: '',
    mainContent,
    indentLevel,
    checked: checked ?? false,
    text: mainContent,
    tokens: tokenizeInline(mainContent),
    nestedTokens,
  }
}
