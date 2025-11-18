/**
 * @fileoverview Utility for parsing indented markdown blocks with hierarchical nesting.
 *
 * This utility handles the complex logic of parsing markdown blocks that can contain
 * nested content based on indentation levels, maintaining proper hierarchical structure
 * for lists, task lists, and other indented block types.
 */

export interface ParsedBlock {
  type: string
  raw: string
  mainContent: string
  indentLevel: number
  nestedContent?: string
  nestedTokens?: any[]
  [key: string]: any
}

export interface BlockParserConfig {
  /** Regex pattern to match block items */
  itemPattern: RegExp
  /** Function to extract data from regex match */
  extractItemData: (match: RegExpMatchArray) => {
    mainContent: string
    indentLevel: number
    [key: string]: any
  }
  /** Function to create the final token */
  createToken: (data: any, nestedTokens?: any[]) => ParsedBlock
  /** Base indentation to remove from nested content (default: 2 spaces) */
  baseIndentSize?: number
  /**
   * Custom parser for nested content. If provided, this will be called instead
   * of the default lexer.blockTokens() for parsing nested content.
   * This allows recursive parsing of the same block type.
   */
  customNestedParser?: (dedentedContent: string) => any[] | undefined
}

/**
 * Parses markdown text into hierarchical indented blocks with proper nesting.
 *
 * This utility handles:
 * - Line-by-line parsing with pattern matching
 * - Hierarchical nesting based on indentation levels
 * - Nested content collection and parsing
 * - Empty line handling
 * - Content dedenting for nested blocks
 *
 * The key difference from flat parsing is that this maintains the hierarchical
 * structure where nested items become `nestedTokens` of their parent items,
 * rather than being flattened into a single array.
 *
 * @param src - The markdown source text to parse
 * @param config - Configuration object defining how to parse and create tokens
 * @param lexer - Markdown lexer for parsing nested content
 * @returns Parsed result with hierarchical items, or undefined if no matches
 *
 * @example
 * ```ts
 * const result = parseIndentedBlocks(src, {
 *   itemPattern: /^(\s*)([-+*])\s+\[([ xX])\]\s+(.*)$/,
 *   extractItemData: (match) => ({
 *     indentLevel: match[1].length,
 *     mainContent: match[4],
 *     checked: match[3].toLowerCase() === 'x'
 *   }),
 *   createToken: (data, nestedTokens) => ({
 *     type: 'taskItem',
 *     checked: data.checked,
 *     text: data.mainContent,
 *     nestedTokens
 *   })
 * }, lexer)
 * ```
 */
export function parseIndentedBlocks(
  src: string,
  config: BlockParserConfig,
  lexer: {
    inlineTokens: (src: string) => any[]
    blockTokens: (src: string) => any[]
  },
):
  | {
      items: ParsedBlock[]
      raw: string
    }
  | undefined {
  const lines = src.split('\n')
  const items: ParsedBlock[] = []
  let totalRaw = ''
  let i = 0
  const baseIndentSize = config.baseIndentSize || 2

  while (i < lines.length) {
    const currentLine = lines[i]
    const itemMatch = currentLine.match(config.itemPattern)

    if (!itemMatch) {
      // Not a matching item - stop if we have items, otherwise this isn't our block type
      if (items.length > 0) {
        break
      } else if (currentLine.trim() === '') {
        i += 1
        totalRaw = `${totalRaw}${currentLine}\n`
        continue
      } else {
        return undefined
      }
    }

    const itemData = config.extractItemData(itemMatch)
    const { indentLevel, mainContent } = itemData
    totalRaw = `${totalRaw}${currentLine}\n`

    // Collect content for this item (including nested items)
    const itemContent = [mainContent] // Start with the main text
    i += 1

    // Look ahead for nested content (indented more than current item)
    while (i < lines.length) {
      const nextLine = lines[i]

      if (nextLine.trim() === '') {
        // Empty line - might be end of nested content
        const nextNonEmptyIndex = lines.slice(i + 1).findIndex(l => l.trim() !== '')
        if (nextNonEmptyIndex === -1) {
          // No more content
          break
        }

        const nextNonEmpty = lines[i + 1 + nextNonEmptyIndex]
        const nextIndent = nextNonEmpty.match(/^(\s*)/)?.[1]?.length || 0

        if (nextIndent > indentLevel) {
          // Nested content continues after empty line
          itemContent.push(nextLine)
          totalRaw = `${totalRaw}${nextLine}\n`
          i += 1
          continue
        } else {
          // End of nested content
          break
        }
      }

      const nextIndent = nextLine.match(/^(\s*)/)?.[1]?.length || 0

      if (nextIndent > indentLevel) {
        // This is nested content for the current item
        itemContent.push(nextLine)
        totalRaw = `${totalRaw}${nextLine}\n`
        i += 1
      } else {
        // Same or less indentation - this belongs to parent level
        break
      }
    }

    // Parse nested content if present
    let nestedTokens: any[] | undefined
    const nestedContent = itemContent.slice(1)

    if (nestedContent.length > 0) {
      // Remove the base indentation from nested content
      const dedentedNested = nestedContent
        .map(nestedLine => nestedLine.slice(indentLevel + baseIndentSize)) // Remove base indent + 2 spaces
        .join('\n')

      if (dedentedNested.trim()) {
        // Use custom nested parser if provided, otherwise fall back to default
        if (config.customNestedParser) {
          nestedTokens = config.customNestedParser(dedentedNested)
        } else {
          nestedTokens = lexer.blockTokens(dedentedNested)
        }
      }
    }

    // Create the token using the provided factory function
    const token = config.createToken(itemData, nestedTokens)
    items.push(token)
  }

  if (items.length === 0) {
    return undefined
  }

  return {
    items,
    raw: totalRaw,
  }
}
