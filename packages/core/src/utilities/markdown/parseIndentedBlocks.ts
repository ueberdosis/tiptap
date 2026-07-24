/**
 * @fileoverview Utility for parsing indented markdown blocks with hierarchical nesting.
 *
 * This utility handles the complex logic of parsing markdown blocks that can contain
 * nested content based on indentation levels, maintaining proper hierarchical structure
 * for lists, task lists, and other indented block types.
 */

/**
 * Whether a (leading-whitespace-trimmed) line begins a new markdown block —
 * a list item (bullet, ordered, or task), blockquote, fenced code block, ATX
 * heading, or thematic break. Such a line is not a lazy paragraph continuation
 * and must not be merged into a preceding paragraph.
 */
function isBlockStart(trimmedLine: string): boolean {
  return (
    // oxlint-disable-next-line prefer-string-starts-ends-with
    /^[-+*](\s|$)/.test(trimmedLine) || // bullet / task-item marker
    // oxlint-disable-next-line prefer-string-starts-ends-with
    /^\d+[.)](\s|$)/.test(trimmedLine) || // ordered list marker
    // oxlint-disable-next-line prefer-string-starts-ends-with
    /^>/.test(trimmedLine) || // blockquote
    // oxlint-disable-next-line prefer-string-starts-ends-with
    /^(```|~~~)/.test(trimmedLine) || // fenced code block
    // oxlint-disable-next-line prefer-string-starts-ends-with
    /^#{1,6}(\s|$)/.test(trimmedLine) || // ATX heading
    /^(-{3,}|\*{3,}|_{3,})$/.test(trimmedLine) // thematic break
  )
}

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
    let nestedContent = itemContent.slice(1)

    // Peel off leading lazy paragraph-continuation lines into the item's main
    // content. A soft-wrapped line that directly follows the item's text — no
    // blank line separating it, and not itself the start of a new block — is a
    // continuation of the item's paragraph in CommonMark, not new nested
    // content. Authors (and LLMs) commonly align such wrapped lines under the
    // marker's *text* column (e.g. six columns for `- [ ] `). Previously these
    // were treated as nested content, dedented by a fixed amount that left >= 4
    // residual spaces, and parsed by `marked` as an indented code block — which
    // cannot interrupt a paragraph, so the line was silently dropped. Merging
    // them into `mainContent` (which is tokenized inline by the caller) yields a
    // single paragraph, matching CommonMark renderers.
    let continuationCount = 0
    for (const nestedLine of nestedContent) {
      const trimmed = nestedLine.trim()
      if (trimmed === '' || isBlockStart(trimmed)) {
        break
      }
      continuationCount += 1
    }

    if (continuationCount > 0) {
      const continuationText = nestedContent
        .slice(0, continuationCount)
        .map(nestedLine => nestedLine.trim())
        .join(' ')
      itemData.mainContent = `${itemData.mainContent} ${continuationText}`.trimEnd()
      nestedContent = nestedContent.slice(continuationCount)
    }

    if (nestedContent.length > 0) {
      // Dedent by the smallest leading indentation shared by the non-blank
      // nested lines rather than a fixed `indentLevel + baseIndentSize`, so a
      // genuinely-nested block indented past `indentLevel + baseIndentSize` is
      // not left with residual leading whitespace (which `marked` would parse
      // as an indented code block). Deeper content keeps its relative
      // indentation.
      const nonBlankIndents = nestedContent
        .filter(nestedLine => nestedLine.trim() !== '')
        .map(nestedLine => nestedLine.length - nestedLine.trimStart().length)
      const dedentAmount =
        nonBlankIndents.length > 0 ? Math.min(...nonBlankIndents) : indentLevel + baseIndentSize
      const dedentedNested = nestedContent
        .map(nestedLine => nestedLine.slice(dedentAmount))
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
