import type { JSONContent, MarkdownLexerConfiguration, MarkdownParseHelpers, MarkdownToken } from '@tiptap/core'

/**
 * Matches an ordered list item line with optional leading whitespace.
 * Captures: (1) indentation spaces, (2) item number, (3) content after marker
 * Example matches: "1. Item", "  2. Nested item", "    3. Deeply nested"
 */
const ORDERED_LIST_ITEM_REGEX = /^(\s*)(\d+)\.\s+(.*)$/

/**
 * Matches any line that starts with whitespace (indented content).
 * Used to identify continuation content that belongs to a list item.
 */
const INDENTED_LINE_REGEX = /^\s/

/**
 * Represents a parsed ordered list item with indentation information
 */
export interface OrderedListItem {
  indent: number
  number: number
  content: string
  raw: string
}

/**
 * Collects all ordered list items from lines, parsing them into a flat array
 * with indentation information. Stops collecting continuation content when
 * encountering nested list items, allowing them to be processed separately.
 *
 * @param lines - Array of source lines to parse
 * @returns Tuple of [listItems array, number of lines consumed]
 */
export function collectOrderedListItems(lines: string[]): [OrderedListItem[], number] {
  const listItems: OrderedListItem[] = []
  let currentLineIndex = 0
  let consumed = 0

  while (currentLineIndex < lines.length) {
    const line = lines[currentLineIndex]
    const match = line.match(ORDERED_LIST_ITEM_REGEX)

    if (!match) {
      break
    }

    const [, indent, number, content] = match
    const indentLevel = indent.length
    let itemContent = content
    let nextLineIndex = currentLineIndex + 1
    const itemLines = [line]

    // Collect continuation lines for this item (but NOT nested list items)
    while (nextLineIndex < lines.length) {
      const nextLine = lines[nextLineIndex]
      const nextMatch = nextLine.match(ORDERED_LIST_ITEM_REGEX)

      // If it's another list item (nested or not), stop collecting
      if (nextMatch) {
        break
      }

      // Check for continuation content (non-list content)
      if (nextLine.trim() === '') {
        // Empty line
        itemLines.push(nextLine)
        itemContent += '\n'
        nextLineIndex += 1
      } else if (nextLine.match(INDENTED_LINE_REGEX)) {
        // Indented content - part of this item (but not a list item)
        itemLines.push(nextLine)
        itemContent += `\n${nextLine.slice(indentLevel + 2)}` // Remove list marker indent
        nextLineIndex += 1
      } else {
        // Non-indented line means end of list
        break
      }
    }

    listItems.push({
      indent: indentLevel,
      number: parseInt(number, 10),
      content: itemContent.trim(),
      raw: itemLines.join('\n'),
    })

    consumed = nextLineIndex
    currentLineIndex = nextLineIndex
  }

  return [listItems, consumed]
}

/**
 * Recursively builds a nested structure from a flat array of list items
 * based on their indentation levels. Creates proper markdown tokens with
 * nested lists where appropriate.
 *
 * @param items - Flat array of list items with indentation info
 * @param baseIndent - The indentation level to process at this recursion level
 * @param lexer - Markdown lexer for parsing inline and block content
 * @returns Array of list_item tokens with proper nesting
 */
export function buildNestedStructure(
  items: OrderedListItem[],
  baseIndent: number,
  lexer: MarkdownLexerConfiguration,
): unknown[] {
  const result: unknown[] = []
  let currentIndex = 0

  while (currentIndex < items.length) {
    const item = items[currentIndex]

    if (item.indent === baseIndent) {
      // This item belongs at the current level
      const contentLines = item.content.split('\n')
      const mainText = contentLines[0]?.trim() || ''

      const tokens = []

      // Always wrap the main text in a paragraph token
      if (mainText) {
        tokens.push({
          type: 'paragraph',
          raw: mainText,
          tokens: lexer.inlineTokens(mainText),
        })
      }

      // Handle additional content after the main text
      const additionalContent = contentLines.slice(1).join('\n').trim()
      if (additionalContent) {
        // Parse as block tokens (handles mixed unordered lists, etc.)
        const blockTokens = lexer.blockTokens(additionalContent)
        tokens.push(...blockTokens)
      }

      // Look ahead to find nested items at deeper indent levels
      let lookAheadIndex = currentIndex + 1
      const nestedItems = []

      while (lookAheadIndex < items.length && items[lookAheadIndex].indent > baseIndent) {
        nestedItems.push(items[lookAheadIndex])
        lookAheadIndex += 1
      }

      // If we have nested items, recursively build their structure
      if (nestedItems.length > 0) {
        // Find the next indent level (immediate children)
        const nextIndent = Math.min(...nestedItems.map(nestedItem => nestedItem.indent))

        // Build the nested list recursively with all nested items
        // The recursive call will handle further nesting
        const nestedListItems = buildNestedStructure(nestedItems, nextIndent, lexer)

        // Create a nested list token
        tokens.push({
          type: 'list',
          ordered: true,
          start: nestedItems[0].number,
          items: nestedListItems,
          raw: nestedItems.map(nestedItem => nestedItem.raw).join('\n'),
        })
      }

      result.push({
        type: 'list_item',
        raw: item.raw,
        tokens,
      })

      // Skip the nested items we just processed
      currentIndex = lookAheadIndex
    } else {
      // This item has deeper indent than we're currently processing
      // It should be handled by a recursive call
      currentIndex += 1
    }
  }

  return result
}

/**
 * Parses markdown list item tokens into Tiptap JSONContent structure,
 * ensuring text content is properly wrapped in paragraph nodes.
 *
 * @param items - Array of markdown tokens representing list items
 * @param helpers - Markdown parse helpers for recursive parsing
 * @returns Array of listItem JSONContent nodes
 */
export function parseListItems(items: MarkdownToken[], helpers: MarkdownParseHelpers): JSONContent[] {
  return items.map(item => {
    if (item.type !== 'list_item') {
      return helpers.parseChildren([item])[0]
    }

    // Parse the tokens within the list item
    const content: JSONContent[] = []

    if (item.tokens && item.tokens.length > 0) {
      item.tokens.forEach(itemToken => {
        // If it's already a proper block node (paragraph, list, etc.), parse it directly
        if (
          itemToken.type === 'paragraph' ||
          itemToken.type === 'list' ||
          itemToken.type === 'blockquote' ||
          itemToken.type === 'code'
        ) {
          content.push(...helpers.parseChildren([itemToken]))
        } else if (itemToken.type === 'text' && itemToken.tokens) {
          // If it's inline text tokens, wrap them in a paragraph
          const inlineContent = helpers.parseChildren([itemToken])
          content.push({
            type: 'paragraph',
            content: inlineContent,
          })
        } else {
          // For any other content, try to parse it
          const parsed = helpers.parseChildren([itemToken])
          if (parsed.length > 0) {
            content.push(...parsed)
          }
        }
      })
    }

    return {
      type: 'listItem',
      content,
    }
  })
}
