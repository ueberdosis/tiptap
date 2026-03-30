import {
  type AnyExtension,
  type ExtendableConfig,
  type JSONContent,
  type MarkdownExtensionSpec,
  type MarkdownLexerConfiguration,
  type MarkdownParseHelpers,
  type MarkdownParseResult,
  type MarkdownRendererHelpers,
  type MarkdownToken,
  type MarkdownTokenizer,
  type RenderContext,
  callOrReturn,
  decodeHtmlEntities,
  encodeHtmlEntities,
  flattenExtensions,
  generateJSON,
  getExtensionField,
} from '@tiptap/core'
import { type Lexer, type Token, type TokenizerExtension, type TokenizerThis, marked } from 'marked'

import {
  closeMarksBeforeNode,
  findMarksToClose,
  findMarksToCloseAtEnd,
  findMarksToOpen,
  isTaskItem,
  reopenMarksAfterNode,
  wrapInMarkdownBlock,
} from './utils.js'

export class MarkdownManager {
  private markedInstance: typeof marked
  private activeParseLexer: Lexer | null = null
  private registry: Map<string, MarkdownExtensionSpec[]>
  private nodeTypeRegistry: Map<string, MarkdownExtensionSpec[]>
  private indentStyle: 'space' | 'tab'
  private indentSize: number
  private baseExtensions: AnyExtension[] = []
  private extensions: AnyExtension[] = []
  /** Set of extension names whose `code` spec property is truthy (nodes and marks). */
  private codeTypes: Set<string> = new Set()

  /**
   * Create a MarkdownManager.
   * @param options.marked Optional marked instance to use (injected).
   * @param options.markedOptions Optional options to pass to marked.setOptions
   * @param options.indentation Indentation settings (style and size).
   * @param options.extensions An array of Tiptap extensions to register for markdown parsing and rendering.
   */
  constructor(options?: {
    marked?: typeof marked
    markedOptions?: Parameters<typeof marked.setOptions>[0]
    indentation?: { style?: 'space' | 'tab'; size?: number }
    extensions: AnyExtension[]
  }) {
    this.markedInstance = options?.marked ?? marked
    this.indentStyle = options?.indentation?.style ?? 'space'
    this.indentSize = options?.indentation?.size ?? 2
    this.baseExtensions = options?.extensions || []

    if (options?.markedOptions && typeof this.markedInstance.setOptions === 'function') {
      this.markedInstance.setOptions(options.markedOptions)
    }

    this.registry = new Map()
    this.nodeTypeRegistry = new Map()

    // If extensions were provided, register them now
    if (options?.extensions) {
      this.baseExtensions = options.extensions
      const flattened = flattenExtensions(options.extensions)
      flattened.forEach(ext => this.registerExtension(ext))
    }
  }

  /** Returns the underlying marked instance. */
  get instance(): typeof marked {
    return this.markedInstance
  }

  /** Returns the correct indentCharacter (space or tab) */
  get indentCharacter(): string {
    return this.indentStyle === 'space' ? ' ' : '\t'
  }

  /** Returns the correct indentString repeated X times */
  get indentString(): string {
    return this.indentCharacter.repeat(this.indentSize)
  }

  /** Helper to quickly check whether a marked instance is available. */
  hasMarked(): boolean {
    return !!this.markedInstance
  }

  /**
   * Register a Tiptap extension (Node/Mark/Extension). This will read
   * `markdownName`, `parseMarkdown`, `renderMarkdown` and `priority` from the
   * extension config (using the same resolution used across the codebase).
   */
  registerExtension(extension: AnyExtension): void {
    // Keep track of all extensions for HTML parsing
    this.extensions.push(extension)

    // Track extensions that declare `code: true` so we can skip HTML entity
    // encoding inside code contexts without hardcoding specific type names.
    const isCode = callOrReturn(getExtensionField(extension, 'code'))

    const name = extension.name

    if (isCode) {
      this.codeTypes.add(name)
    }
    const tokenName =
      (getExtensionField(extension, 'markdownTokenName') as ExtendableConfig['markdownTokenName']) || name
    const parseMarkdown = getExtensionField(extension, 'parseMarkdown') as ExtendableConfig['parseMarkdown'] | undefined
    const renderMarkdown = getExtensionField(extension, 'renderMarkdown') as
      | ExtendableConfig['renderMarkdown']
      | undefined
    const tokenizer = getExtensionField(extension, 'markdownTokenizer') as
      | ExtendableConfig['markdownTokenizer']
      | undefined

    // Read the `markdown` object from the extension config. This allows
    // extensions to provide `markdown: { name?, parseName?, renderName?, parse?, render?, match? }`.
    const markdownCfg = (getExtensionField(extension, 'markdownOptions') ?? null) as ExtendableConfig['markdownOptions']
    const isIndenting = markdownCfg?.indentsContent ?? false
    const htmlReopen = markdownCfg?.htmlReopen

    const spec: MarkdownExtensionSpec = {
      tokenName,
      nodeName: name,
      parseMarkdown,
      renderMarkdown,
      isIndenting,
      htmlReopen,
      tokenizer,
    }

    // Add to parse registry using parseName
    if (tokenName && parseMarkdown) {
      const parseExisting = this.registry.get(tokenName) || []
      parseExisting.push(spec)
      this.registry.set(tokenName, parseExisting)
    }

    // Add to render registry using renderName (node type)
    if (renderMarkdown) {
      const renderExisting = this.nodeTypeRegistry.get(name) || []
      renderExisting.push(spec)
      this.nodeTypeRegistry.set(name, renderExisting)
    }

    // Register custom tokenizer with marked.js
    if (tokenizer && this.hasMarked()) {
      this.registerTokenizer(tokenizer)
    }
  }

  private createLexer(): Lexer {
    return new this.markedInstance.Lexer()
  }

  private createTokenizerHelpers(lexer: Lexer): MarkdownLexerConfiguration {
    return {
      inlineTokens: (src: string) => lexer.inlineTokens(src),
      blockTokens: (src: string) => lexer.blockTokens(src),
    }
  }

  private tokenizeInline(src: string): MarkdownToken[] {
    return (this.activeParseLexer ?? this.createLexer()).inlineTokens(src) as MarkdownToken[]
  }

  /**
   * Register a custom tokenizer with marked.js for parsing non-standard markdown syntax.
   */
  private registerTokenizer(tokenizer: MarkdownTokenizer): void {
    if (!this.hasMarked()) {
      return
    }

    const { name, start, level = 'inline', tokenize } = tokenizer
    const createTokenizerHelpers = this.createTokenizerHelpers.bind(this)
    const createLexer = this.createLexer.bind(this)

    let startCb: (src: string) => number

    if (!start) {
      startCb = (src: string) => {
        // For other tokenizers, try to find a match and return its position
        const result = tokenize(src, [], this.createTokenizerHelpers(this.createLexer()))
        if (result && result.raw) {
          const index = src.indexOf(result.raw)
          return index
        }
        return -1
      }
    } else {
      startCb = typeof start === 'function' ? start : (src: string) => src.indexOf(start)
    }

    // Create marked.js extension with proper types
    const markedExtension: TokenizerExtension = {
      name,
      level,
      start: startCb,
      tokenizer(this: TokenizerThis, src, tokens) {
        const helper = this.lexer ? createTokenizerHelpers(this.lexer) : createTokenizerHelpers(createLexer())
        const result = tokenize(src, tokens, helper)

        if (result && result.type) {
          return {
            ...result,
            type: result.type || name,
            raw: result.raw || '',
            tokens: (result.tokens || []) as Token[],
          }
        }

        return undefined
      },
      childTokens: [],
    }

    // Register with marked.js - use extensions array to control priority
    this.markedInstance.use({
      extensions: [markedExtension],
    })
  }

  /** Get registered handlers for a token type and try each until one succeeds. */
  private getHandlersForToken(type: string): MarkdownExtensionSpec[] {
    try {
      return this.registry.get(type) || []
    } catch {
      return []
    }
  }

  /** Get the first handler for a token type (for backwards compatibility). */
  private getHandlerForToken(type: string): MarkdownExtensionSpec | undefined {
    // First try the markdown token registry (for parsing)
    const markdownHandlers = this.getHandlersForToken(type)
    if (markdownHandlers.length > 0) {
      return markdownHandlers[0]
    }

    // Then try the node type registry (for rendering)
    const nodeTypeHandlers = this.getHandlersForNodeType(type)
    return nodeTypeHandlers.length > 0 ? nodeTypeHandlers[0] : undefined
  }

  /** Get registered handlers for a node type (for rendering). */
  private getHandlersForNodeType(type: string): MarkdownExtensionSpec[] {
    try {
      return this.nodeTypeRegistry.get(type) || []
    } catch {
      return []
    }
  }

  /**
   * Serialize a ProseMirror-like JSON document (or node array) to a Markdown string
   * using registered renderers and fallback renderers.
   */
  serialize(docOrContent: JSONContent): string {
    if (!docOrContent) {
      return ''
    }

    const result = this.renderNodes(docOrContent, docOrContent)
    // Return empty string if result is only whitespace entities or non-breaking spaces
    return this.isEmptyOutput(result) ? '' : result
  }

  /**
   * Check if the markdown output represents an empty document.
   * Empty documents may contain only &nbsp; entities or non-breaking space characters
   * which are used by the Paragraph extension to preserve blank lines.
   */
  private isEmptyOutput(markdown: string): boolean {
    if (!markdown || markdown.trim() === '') {
      return true
    }

    // Check if the output is only &nbsp; entities or non-breaking space characters
    const cleanedOutput = markdown
      .replace(/&nbsp;/g, '')
      .replace(/\u00A0/g, '')
      .trim()
    return cleanedOutput === ''
  }

  /**
   * Parse markdown string into Tiptap JSON document using registered extension handlers.
   */
  parse(markdown: string): JSONContent {
    if (!this.hasMarked()) {
      throw new Error('No marked instance available for parsing')
    }

    const previousParseLexer = this.activeParseLexer
    const parseLexer = this.createLexer()

    this.activeParseLexer = parseLexer

    try {
      // Use a parse-scoped lexer so follow-up inline tokenization can reuse
      // the same configured lexer state without sharing it across parses.
      const tokens = parseLexer.lex(markdown) as MarkdownToken[]

      // Convert tokens to Tiptap JSON
      const content = this.parseTokens(tokens, true)

      // Return a document node containing the parsed content
      return {
        type: 'doc',
        content,
      }
    } finally {
      this.activeParseLexer = previousParseLexer
    }
  }

  /**
   * Convert an array of marked tokens into Tiptap JSON nodes using registered extension handlers.
   */
  private parseTokens(tokens: MarkdownToken[], parseImplicitEmptyParagraphs = false): JSONContent[] {
    const nonSpaceTokenIndexes = tokens.reduce<number[]>((indexes, token, index) => {
      if (token.type !== 'space') {
        indexes.push(index)
      }

      return indexes
    }, [])

    let previousNonSpaceTokenIndex = -1
    let nextNonSpaceTokenPointer = 0

    return tokens.flatMap((token, index) => {
      while (
        nextNonSpaceTokenPointer < nonSpaceTokenIndexes.length &&
        nonSpaceTokenIndexes[nextNonSpaceTokenPointer] < index
      ) {
        previousNonSpaceTokenIndex = nonSpaceTokenIndexes[nextNonSpaceTokenPointer]
        nextNonSpaceTokenPointer += 1
      }

      if (parseImplicitEmptyParagraphs && token.type === 'space') {
        const nextNonSpaceTokenIndex = nonSpaceTokenIndexes[nextNonSpaceTokenPointer] ?? -1

        return this.createImplicitEmptyParagraphsFromSpace(token, previousNonSpaceTokenIndex, nextNonSpaceTokenIndex)
      }

      const parsed = this.parseToken(token, parseImplicitEmptyParagraphs)

      if (parsed === null) {
        return []
      }

      return Array.isArray(parsed) ? parsed : [parsed]
    })
  }

  private createImplicitEmptyParagraphsFromSpace(
    token: MarkdownToken,
    previousNonSpaceTokenIndex: number,
    nextNonSpaceTokenIndex: number,
  ): JSONContent[] {
    const separatorCount = this.countParagraphSeparators(token.raw || '')

    if (separatorCount === 0) {
      return []
    }

    const isBoundarySpace = previousNonSpaceTokenIndex === -1 || nextNonSpaceTokenIndex === -1
    const emptyParagraphCount = Math.max(separatorCount - (isBoundarySpace ? 0 : 1), 0)

    return Array.from({ length: emptyParagraphCount }, () => ({ type: 'paragraph', content: [] }))
  }

  private countParagraphSeparators(raw: string): number {
    return (raw.replace(/\r\n/g, '\n').match(/\n\n/g) || []).length
  }

  /**
   * Parse a single token into Tiptap JSON using the appropriate registered handler.
   */
  private parseToken(token: MarkdownToken, parseImplicitEmptyParagraphs = false): JSONContent | JSONContent[] | null {
    if (!token.type) {
      return null
    }

    // Special handling for 'list' tokens that may contain mixed bullet/task items
    if (token.type === 'list') {
      return this.parseListToken(token)
    }

    const handlers = this.getHandlersForToken(token.type)
    const helpers = this.createParseHelpers()

    // Try each handler until one returns a valid result
    const result = handlers.find(handler => {
      if (!handler.parseMarkdown) {
        return false
      }

      const parseResult = handler.parseMarkdown(token, helpers)
      const normalized = this.normalizeParseResult(parseResult)

      // Check if this handler returned a valid result (not null/empty array)
      if (normalized && (!Array.isArray(normalized) || normalized.length > 0)) {
        // Store result for return
        this.lastParseResult = normalized
        return true
      }

      return false
    })

    // If a handler worked, return its result
    if (result && this.lastParseResult) {
      const toReturn = this.lastParseResult
      this.lastParseResult = null // Clean up
      return toReturn
    }

    // If no handler worked, try fallback parsing
    return this.parseFallbackToken(token, parseImplicitEmptyParagraphs)
  }

  private lastParseResult: JSONContent | JSONContent[] | null = null

  /**
   * Parse a list token, handling mixed bullet and task list items by splitting them into separate lists.
   * This ensures that consecutive task items and bullet items are grouped and parsed as separate list nodes.
   *
   * @param token The list token to parse
   * @returns Array of parsed list nodes, or null if parsing fails
   */
  private parseListToken(token: MarkdownToken): JSONContent | JSONContent[] | null {
    if (!token.items || token.items.length === 0) {
      // No items, parse normally
      return this.parseTokenWithHandlers(token)
    }

    const hasTask = token.items.some(item => isTaskItem(item).isTask)
    const hasNonTask = token.items.some(item => !isTaskItem(item).isTask)

    if (!hasTask || !hasNonTask || this.getHandlersForToken('taskList').length === 0) {
      // Not mixed or no taskList extension, parse normally
      return this.parseTokenWithHandlers(token)
    }

    // Mixed list with taskList extension available: split into separate lists
    type TaskListItemToken = MarkdownToken & { type: 'taskItem'; checked?: boolean; indentLevel?: number }
    const groups: { type: 'list' | 'taskList'; items: (MarkdownToken | TaskListItemToken)[] }[] = []
    let currentGroup: (MarkdownToken | TaskListItemToken)[] = []
    let currentType: 'list' | 'taskList' | null = null

    for (let i = 0; i < token.items.length; i += 1) {
      const item = token.items[i]
      const { isTask, checked, indentLevel } = isTaskItem(item)
      let processedItem = item

      if (isTask) {
        // Transform list_item into taskItem token
        const raw = item.raw || item.text || ''

        // Split raw content by lines to separate main content from nested
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
              const minIndent = Math.min(...nonEmptyLines.map(line => line.length - line.trimStart().length))
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
                // Use the full lexer pipeline to ensure inline tokens are populated
                nestedTokens = this.markedInstance.lexer(`${nestedContent}\n`)
              }
            }
          }
        }

        processedItem = {
          type: 'taskItem',
          raw: '',
          mainContent,
          indentLevel,
          checked: checked ?? false,
          text: mainContent,
          tokens: this.tokenizeInline(mainContent),
          nestedTokens,
        }
      }

      const itemType: 'list' | 'taskList' = isTask ? 'taskList' : 'list'

      if (currentType !== itemType) {
        if (currentGroup.length > 0) {
          groups.push({ type: currentType!, items: currentGroup })
        }
        currentGroup = [processedItem]
        currentType = itemType
      } else {
        currentGroup.push(processedItem)
      }
    }

    if (currentGroup.length > 0) {
      groups.push({ type: currentType!, items: currentGroup })
    }

    // Parse each group as a separate token
    const results: JSONContent[] = []
    for (let i = 0; i < groups.length; i += 1) {
      const group = groups[i]
      const subToken = { ...token, type: group.type, items: group.items }
      const parsed = this.parseToken(subToken)
      if (parsed) {
        if (Array.isArray(parsed)) {
          results.push(...parsed)
        } else {
          results.push(parsed)
        }
      }
    }

    return results.length > 0 ? results : null
  }

  /**
   * Parse a token using registered handlers (extracted for reuse).
   */
  private parseTokenWithHandlers(token: MarkdownToken): JSONContent | JSONContent[] | null {
    if (!token.type) {
      return null
    }

    const handlers = this.getHandlersForToken(token.type)
    const helpers = this.createParseHelpers()

    // Try each handler until one returns a valid result
    const result = handlers.find(handler => {
      if (!handler.parseMarkdown) {
        return false
      }

      const parseResult = handler.parseMarkdown(token, helpers)
      const normalized = this.normalizeParseResult(parseResult)

      // Check if this handler returned a valid result (not null/empty array)
      if (normalized && (!Array.isArray(normalized) || normalized.length > 0)) {
        // Store result for return
        this.lastParseResult = normalized
        return true
      }

      return false
    })

    // If a handler worked, return its result
    if (result && this.lastParseResult) {
      const toReturn = this.lastParseResult
      this.lastParseResult = null // Clean up
      return toReturn
    }

    // If no handler worked, try fallback parsing
    return this.parseFallbackToken(token)
  }

  /**
   * Creates helper functions for parsing markdown tokens.
   * @returns An object containing helper functions for parsing.
   */
  private createParseHelpers(): MarkdownParseHelpers {
    return {
      parseInline: (tokens: MarkdownToken[]) => this.parseInlineTokens(tokens),
      parseChildren: (tokens: MarkdownToken[]) => this.parseTokens(tokens),
      parseBlockChildren: (tokens: MarkdownToken[]) => this.parseTokens(tokens, true),
      createTextNode: (text: string, marks?: Array<{ type: string; attrs?: any }>) => {
        const node = {
          type: 'text',
          text,
          marks: marks || undefined,
        }

        return node
      },
      createNode: (type: string, attrs?: any, content?: JSONContent[]) => {
        const node = {
          type,
          attrs: attrs || undefined,
          content: content || undefined,
        }

        if (!attrs || Object.keys(attrs).length === 0) {
          delete node.attrs
        }

        return node
      },
      applyMark: (markType: string, content: JSONContent[], attrs?: any) => ({
        mark: markType,
        content,
        attrs: attrs && Object.keys(attrs).length > 0 ? attrs : undefined,
      }),
    }
  }

  /**
   * Escape special regex characters in a string.
   */
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }

  /**
   * Parse inline tokens (bold, italic, links, etc.) into text nodes with marks.
   * This is the complex part that handles mark nesting and boundaries.
   */
  private parseInlineTokens(tokens: MarkdownToken[]): JSONContent[] {
    const result: JSONContent[] = []

    // Process tokens sequentially using an index so we can lookahead and
    // merge split inline HTML fragments like: text / <em> / inner / </em> / text
    for (let i = 0; i < tokens.length; i += 1) {
      const token = tokens[i]

      if (token.type === 'text') {
        // Create text node – decode HTML entities so that e.g. `&lt;` displays as `<` in the editor
        result.push({
          type: 'text',
          text: decodeHtmlEntities(token.text || ''),
        })
      } else if (token.type === 'html') {
        // Handle possible split inline HTML by attempting to detect an
        // opening tag and searching forward for a matching closing tag.
        const raw = (token.raw ?? token.text ?? '').toString()

        // Quick checks for opening vs. closing tag
        const isClosing = /^<\/[\s]*[\w-]+/i.test(raw)
        const openMatch = raw.match(/^<[\s]*([\w-]+)(\s|>|\/|$)/i)

        if (!isClosing && openMatch && !/\/>$/.test(raw)) {
          // Try to find the corresponding closing html token for this tag
          const tagName = openMatch[1]
          const escapedTagName = this.escapeRegex(tagName)
          const closingRegex = new RegExp(`^<\\/\\s*${escapedTagName}\\b`, 'i')
          let foundIndex = -1

          // Collect intermediate raw parts to reconstruct full HTML fragment
          const parts: string[] = [raw]
          for (let j = i + 1; j < tokens.length; j += 1) {
            const t = tokens[j]
            const tRaw = (t.raw ?? t.text ?? '').toString()
            parts.push(tRaw)
            if (t.type === 'html' && closingRegex.test(tRaw)) {
              foundIndex = j
              break
            }
          }

          if (foundIndex !== -1) {
            // Merge opening + inner + closing into one html fragment and parse
            const mergedRaw = parts.join('')
            const mergedToken = {
              type: 'html',
              raw: mergedRaw,
              text: mergedRaw,
              block: false,
            } as unknown as MarkdownToken

            const parsed = this.parseHTMLToken(mergedToken)
            if (parsed) {
              const normalized = this.normalizeParseResult(parsed as any)
              if (Array.isArray(normalized)) {
                result.push(...normalized)
              } else if (normalized) {
                result.push(normalized)
              }
            }

            // Advance i to the closing token
            i = foundIndex
            continue
          }
        }

        // Fallback: single html token parse
        const parsedSingle = this.parseHTMLToken(token)
        if (parsedSingle) {
          const normalized = this.normalizeParseResult(parsedSingle as any)
          if (Array.isArray(normalized)) {
            result.push(...normalized)
          } else if (normalized) {
            result.push(normalized)
          }
        }
      } else if (token.type) {
        // Handle inline marks (bold, italic, etc.)
        const markHandler = this.getHandlerForToken(token.type)
        if (markHandler && markHandler.parseMarkdown) {
          const helpers = this.createParseHelpers()
          const parsed = markHandler.parseMarkdown(token, helpers)

          if (this.isMarkResult(parsed)) {
            // This is a mark result - apply the mark to the content
            const markedContent = this.applyMarkToContent(parsed.mark, parsed.content, parsed.attrs)
            result.push(...markedContent)
          } else {
            // Regular inline node
            const normalized = this.normalizeParseResult(parsed)
            if (Array.isArray(normalized)) {
              result.push(...normalized)
            } else if (normalized) {
              result.push(normalized)
            }
          }
        } else if (token.tokens) {
          // Fallback: try to parse children if they exist
          result.push(...this.parseInlineTokens(token.tokens))
        }
      }
    }

    return result
  }

  /**
   * Apply a mark to content nodes.
   */
  private applyMarkToContent(markType: string, content: JSONContent[], attrs?: any): JSONContent[] {
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
        content: node.content ? this.applyMarkToContent(markType, node.content, attrs) : undefined,
      }
    })
  } /**
   * Check if a parse result represents a mark to be applied.
   */
  private isMarkResult(result: any): result is { mark: string; content: JSONContent[]; attrs?: any } {
    return result && typeof result === 'object' && 'mark' in result
  }

  /**
   * Normalize parse results to ensure they're valid JSONContent.
   */
  private normalizeParseResult(result: MarkdownParseResult): JSONContent | JSONContent[] | null {
    if (!result) {
      return null
    }

    if (this.isMarkResult(result)) {
      // This shouldn't happen at the top level, but handle it gracefully
      return result.content
    }

    return result as JSONContent | JSONContent[]
  }

  /**
   * Fallback parsing for common tokens when no specific handler is registered.
   */
  private parseFallbackToken(
    token: MarkdownToken,
    parseImplicitEmptyParagraphs = false,
  ): JSONContent | JSONContent[] | null {
    switch (token.type) {
      case 'paragraph':
        return {
          type: 'paragraph',
          content: token.tokens ? this.parseInlineTokens(token.tokens) : [],
        }

      case 'heading':
        return {
          type: 'heading',
          attrs: { level: token.depth || 1 },
          content: token.tokens ? this.parseInlineTokens(token.tokens) : [],
        }

      case 'text':
        return {
          type: 'text',
          text: decodeHtmlEntities(token.text || ''),
        }

      case 'html':
        // Parse HTML using extensions' parseHTML methods
        return this.parseHTMLToken(token)

      case 'space':
        return null

      default:
        // Unknown token type - try to parse children if they exist
        if (token.tokens) {
          return this.parseTokens(token.tokens, parseImplicitEmptyParagraphs)
        }
        return null
    }
  }

  /**
   * Parse HTML tokens using extensions' parseHTML methods.
   * This allows HTML within markdown to be parsed according to extension rules.
   */
  private parseHTMLToken(token: MarkdownToken): JSONContent | JSONContent[] | null {
    const html = token.text || token.raw || ''

    if (!html.trim()) {
      return null
    }

    // Check if we're in a server-side environment (no window object)
    // If so, fall back to treating HTML as plain text to avoid runtime errors
    if (typeof window === 'undefined') {
      // For block-level HTML, wrap in a paragraph to maintain valid document structure
      if (token.block) {
        return {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: html,
            },
          ],
        }
      }
      // For inline HTML, return plain text
      return {
        type: 'text',
        text: html,
      }
    }

    // Use generateJSON to parse the HTML using extensions' parseHTML rules
    try {
      const parsed = generateJSON(html, this.baseExtensions)

      // If the result is a doc node, extract its content
      if (parsed.type === 'doc' && parsed.content) {
        // For block-level HTML, return the content array
        if (token.block) {
          return parsed.content
        }

        // For inline HTML, we need to flatten the content appropriately
        // If there's only one paragraph with content, unwrap it
        if (parsed.content.length === 1 && parsed.content[0].type === 'paragraph' && parsed.content[0].content) {
          return parsed.content[0].content
        }

        return parsed.content
      }

      return parsed as JSONContent
    } catch (error) {
      throw new Error(`Failed to parse HTML in markdown: ${error}`)
    }
  }

  /**
   * Encode HTML entities in text unless the node is inside a code context
   * (code mark or code-block parent) where literal characters should be preserved.
   */
  private encodeTextForMarkdown(text: string, node: JSONContent, parentNode?: JSONContent): string {
    const isInsideCode =
      (parentNode?.type != null && this.codeTypes.has(parentNode.type)) ||
      (node.marks || []).some(m => this.codeTypes.has(typeof m === 'string' ? m : m.type))

    return isInsideCode ? text : encodeHtmlEntities(text)
  }

  renderNodeToMarkdown(
    node: JSONContent,
    parentNode?: JSONContent,
    index = 0,
    level = 0,
    meta: Record<string, any> = {},
  ): string {
    // if node is a text node, we simply return it's text content
    // marks are handled at the array level in renderNodesWithMarkBoundaries
    if (node.type === 'text') {
      return this.encodeTextForMarkdown(node.text || '', node, parentNode)
    }

    if (!node.type) {
      return ''
    }

    const handler = this.getHandlerForToken(node.type)
    if (!handler) {
      return ''
    }

    const previousNode = Array.isArray(parentNode?.content) && index > 0 ? parentNode.content[index - 1] : undefined
    const helpers: MarkdownRendererHelpers = {
      renderChildren: (nodes, separator) => {
        const childLevel = handler.isIndenting ? level + 1 : level

        if (!Array.isArray(nodes) && (nodes as any).content) {
          return this.renderNodes((nodes as any).content as JSONContent[], node, separator || '', index, childLevel)
        }

        return this.renderNodes(nodes, node, separator || '', index, childLevel)
      },
      renderChild: (childNode, childIndex) => {
        const childLevel = handler.isIndenting ? level + 1 : level

        return this.renderNodeToMarkdown(childNode, node, childIndex, childLevel)
      },
      indent: content => {
        return this.indentString + content
      },
      wrapInBlock: wrapInMarkdownBlock,
    }

    const context: RenderContext = {
      index,
      level,
      parentType: parentNode?.type,
      previousNode,
      meta: {
        parentAttrs: parentNode?.attrs,
        ...meta,
      },
    }

    // First render the node itself (this will render children recursively)
    const rendered = handler.renderMarkdown?.(node, helpers, context) || ''

    return rendered
  }

  /**
   * Render a node or an array of nodes. Parent type controls how children
   * are joined (which determines newline insertion between children).
   */
  renderNodes(
    nodeOrNodes: JSONContent | JSONContent[],
    parentNode?: JSONContent,
    separator = '',
    index = 0,
    level = 0,
  ): string {
    // if we have just one node, call renderNodeToMarkdown directly
    if (!Array.isArray(nodeOrNodes)) {
      if (!nodeOrNodes.type) {
        return ''
      }

      return this.renderNodeToMarkdown(nodeOrNodes, parentNode, index, level)
    }

    return this.renderNodesWithMarkBoundaries(nodeOrNodes, parentNode, separator, level)
  }

  /**
   * Render an array of nodes while properly tracking mark boundaries.
   * This handles cases where marks span across multiple text nodes.
   */
  private renderNodesWithMarkBoundaries(
    nodes: JSONContent[],
    parentNode?: JSONContent,
    separator = '',
    level = 0,
  ): string {
    const result: string[] = []
    const activeMarks: Map<string, any> = new Map()
    const reopenWithHtmlOnNextOpen = new Set<string>()
    const markOpeningModes = new Map<string, 'markdown' | 'html'>()
    nodes.forEach((node, i) => {
      // Lookahead to the next node to determine if marks need to be closed
      const nextNode = i < nodes.length - 1 ? nodes[i + 1] : null

      if (!node.type) {
        return
      }

      if (node.type === 'text') {
        let textContent = this.encodeTextForMarkdown(node.text || '', node, parentNode)
        const currentMarks = new Map((node.marks || []).map(mark => [mark.type, mark]))

        // Find marks that need to be closed and opened
        const marksToOpen = findMarksToOpen(activeMarks, currentMarks)
        const marksToClose = findMarksToClose(currentMarks, nextNode)

        // When marks simultaneously close (old) AND open (new) at this boundary, the naive
        // approach of appending old-close and prepending new-open produces interleaved
        // delimiters like `*456**` (italic open, text, bold close) instead of properly
        // nested `_456_**` (italic open, text, italic close, bold close).
        //
        // The fix: when both are present, defer old mark closings to the end of the node
        // (after the new marks also close), ensuring correct inner-before-outer order.
        //
        // If an already-active mark ends on this node while another mark opens on this same
        // node, we defer closing the active mark until the end of the node so nesting stays
        // valid (`**...++abc++**` instead of `**...++abc**++`).
        const activeMarksClosingHere = marksToClose.filter(markType => activeMarks.has(markType))
        const hasCrossedBoundary = activeMarksClosingHere.length > 0 && marksToOpen.length > 0

        let middleTrailingWhitespace = ''

        if (marksToClose.length > 0 && !hasCrossedBoundary) {
          // Extract trailing whitespace before closing marks to prevent invalid markdown like "**text **"
          const middleTrailingMatch = textContent.match(/(\s+)$/)
          if (middleTrailingMatch) {
            middleTrailingWhitespace = middleTrailingMatch[1]
            textContent = textContent.slice(0, -middleTrailingWhitespace.length)
          }
        }

        if (!hasCrossedBoundary) {
          // Normal path: close marks that are ending here (no new marks opening simultaneously)
          marksToClose.forEach(markType => {
            if (!activeMarks.has(markType)) {
              return
            }

            const mark = currentMarks.get(markType)
            const closeMarkdown = this.getMarkClosing(markType, mark, markOpeningModes.get(markType))
            if (closeMarkdown) {
              textContent += closeMarkdown
            }
            if (activeMarks.has(markType)) {
              activeMarks.delete(markType)
              markOpeningModes.delete(markType)
            }
          })
        }

        // Open new marks (should be at the beginning)
        // Extract leading whitespace before opening marks to prevent invalid markdown like "** text**"
        let leadingWhitespace = ''
        if (marksToOpen.length > 0) {
          const leadingMatch = textContent.match(/^(\s+)/)
          if (leadingMatch) {
            leadingWhitespace = leadingMatch[1]
            textContent = textContent.slice(leadingWhitespace.length)
          }
        }

        // Snapshot active mark types before opening new marks, so each new mark's delimiter
        // is chosen based on what is already active (not including itself).
        // When crossing a boundary, old marks are still in activeMarks here (not yet removed),
        // so new marks correctly see them as active context.
        marksToOpen.forEach(({ type, mark }) => {
          const openingMode = reopenWithHtmlOnNextOpen.has(type) ? 'html' : 'markdown'
          const openMarkdown = this.getMarkOpening(type, mark, openingMode)
          if (openMarkdown) {
            textContent = openMarkdown + textContent
          }
          markOpeningModes.set(type, openingMode)
          reopenWithHtmlOnNextOpen.delete(type)
        })

        if (!hasCrossedBoundary) {
          marksToOpen
            .slice()
            .reverse()
            .forEach(({ type, mark }) => {
              activeMarks.set(type, mark)
            })
        }

        // Add leading whitespace before the mark opening
        textContent = leadingWhitespace + textContent

        // Determine marks to close at the end of this node.
        // On a crossed boundary, we close new marks (inner) first, then old marks (outer),
        // ensuring correct nesting order. Both sets are removed from activeMarks so the
        // next node's marksToOpen will reopen whichever ones continue.
        let marksToCloseAtEnd: string[]
        if (hasCrossedBoundary) {
          const nextMarkTypes = new Set((nextNode?.marks || []).map((mark: any) => mark.type))

          marksToOpen.forEach(({ type }) => {
            if (nextMarkTypes.has(type) && this.getHtmlReopenTags(type)) {
              reopenWithHtmlOnNextOpen.add(type)
            }
          })

          marksToCloseAtEnd = [
            ...marksToOpen.map(m => m.type), // inner (opened here) — close first
            ...activeMarksClosingHere, // outer (were active before) — close last
          ]
        } else {
          marksToCloseAtEnd = findMarksToCloseAtEnd(activeMarks, currentMarks, nextNode, this.markSetsEqual.bind(this))
        }

        // Extract trailing whitespace before closing marks to prevent invalid markdown like "**text **"
        let trailingWhitespace = ''
        if (marksToCloseAtEnd.length > 0) {
          const trailingMatch = textContent.match(/(\s+)$/)
          if (trailingMatch) {
            trailingWhitespace = trailingMatch[1]
            textContent = textContent.slice(0, -trailingWhitespace.length)
          }
        }

        marksToCloseAtEnd.forEach(markType => {
          const mark = activeMarks.get(markType) ?? currentMarks.get(markType)
          const closeMarkdown = this.getMarkClosing(markType, mark, markOpeningModes.get(markType))
          if (closeMarkdown) {
            textContent += closeMarkdown
          }
          activeMarks.delete(markType)
          markOpeningModes.delete(markType)
        })

        // Add trailing whitespace after the mark closing
        textContent += trailingWhitespace
        textContent += middleTrailingWhitespace

        result.push(textContent)
      } else {
        // For non-text nodes, close all active marks before rendering, then reopen after
        const marksToReopen = new Map(activeMarks)
        const openingModesToReopen = new Map(markOpeningModes)

        // Close all marks before the node
        const beforeMarkdown = closeMarksBeforeNode(activeMarks, (markType, mark) => {
          return this.getMarkClosing(markType, mark, markOpeningModes.get(markType))
        })
        markOpeningModes.clear()

        // Render the node
        const nodeContent = this.renderNodeToMarkdown(node, parentNode, i, level)

        // Reopen marks after the node, but NOT after a hard break
        // Hard breaks should terminate marks (they create a line break where marks don't continue)
        const afterMarkdown =
          node.type === 'hardBreak'
            ? ''
            : reopenMarksAfterNode(marksToReopen, activeMarks, (markType, mark) => {
                const openingMode = openingModesToReopen.get(markType) ?? 'markdown'
                markOpeningModes.set(markType, openingMode)
                return this.getMarkOpening(markType, mark, openingMode)
              })

        result.push(beforeMarkdown + nodeContent + afterMarkdown)
      }
    })

    return result.join(separator)
  }

  /**
   * Get the opening markdown syntax for a mark type.
   */
  private getMarkOpening(markType: string, mark: any, openingMode: 'markdown' | 'html' = 'markdown'): string {
    if (openingMode === 'html') {
      return this.getHtmlReopenTags(markType)?.open || ''
    }

    const handlers = this.getHandlersForNodeType(markType)
    const handler = handlers.length > 0 ? handlers[0] : undefined
    if (!handler || !handler.renderMarkdown) {
      return ''
    }

    // Use a unique placeholder that's extremely unlikely to appear in real content
    const placeholder = '\uE000__TIPTAP_MARKDOWN_PLACEHOLDER__\uE001'

    // For most marks, we can extract the opening syntax by rendering a simple case
    const syntheticNode: JSONContent = {
      type: markType,
      attrs: mark.attrs || {},
      content: [{ type: 'text', text: placeholder }],
    }

    try {
      const rendered = handler.renderMarkdown(
        syntheticNode,
        {
          renderChildren: () => placeholder,
          renderChild: () => placeholder,
          indent: (content: string) => content,
          wrapInBlock: (prefix: string, content: string) => prefix + content,
        },
        { index: 0, level: 0, parentType: 'text', meta: {} },
      )

      // Extract the opening part (everything before placeholder)
      const placeholderIndex = rendered.indexOf(placeholder)
      return placeholderIndex >= 0 ? rendered.substring(0, placeholderIndex) : ''
    } catch (err) {
      throw new Error(`Failed to get mark opening for ${markType}: ${err}`)
    }
  }

  /**
   * Get the closing markdown syntax for a mark type.
   */
  private getMarkClosing(markType: string, mark: any, openingMode: 'markdown' | 'html' = 'markdown'): string {
    if (openingMode === 'html') {
      return this.getHtmlReopenTags(markType)?.close || ''
    }

    const handlers = this.getHandlersForNodeType(markType)
    const handler = handlers.length > 0 ? handlers[0] : undefined
    if (!handler || !handler.renderMarkdown) {
      return ''
    }

    // Use a unique placeholder that's extremely unlikely to appear in real content
    const placeholder = '\uE000__TIPTAP_MARKDOWN_PLACEHOLDER__\uE001'

    const syntheticNode: JSONContent = {
      type: markType,
      attrs: mark.attrs || {},
      content: [{ type: 'text', text: placeholder }],
    }

    try {
      const rendered = handler.renderMarkdown(
        syntheticNode,
        {
          renderChildren: () => placeholder,
          renderChild: () => placeholder,
          indent: (content: string) => content,
          wrapInBlock: (prefix: string, content: string) => prefix + content,
        },
        { index: 0, level: 0, parentType: 'text', meta: {} },
      )

      // Extract the closing part (everything after placeholder)
      const placeholderIndex = rendered.indexOf(placeholder)
      const placeholderEnd = placeholderIndex + placeholder.length
      return placeholderIndex >= 0 ? rendered.substring(placeholderEnd) : ''
    } catch (err) {
      throw new Error(`Failed to get mark closing for ${markType}: ${err}`)
    }
  }

  /**
   * Returns the inline HTML tags an extension exposes for overlap-boundary
   * reopen handling, if that mark explicitly opted into HTML reopen mode.
   */
  private getHtmlReopenTags(markType: string): { open: string; close: string } | undefined {
    const handlers = this.getHandlersForNodeType(markType)
    const handler = handlers.length > 0 ? handlers[0] : undefined

    return handler?.htmlReopen
  }

  /**
   * Check if two mark sets are equal.
   */
  private markSetsEqual(marks1: Map<string, any>, marks2: Map<string, any>): boolean {
    if (marks1.size !== marks2.size) {
      return false
    }

    return Array.from(marks1.keys()).every(type => marks2.has(type))
  }
}

export default MarkdownManager
