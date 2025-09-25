import {
  type AnyExtension,
  type JSONContent,
  type MarkdownExtensionSpec,
  type MarkdownParseHelpers,
  type MarkdownParseResult,
  type MarkdownRendererHelpers,
  type MarkdownToken,
  type MarkdownTokenizer,
  type RenderContext,
  getExtensionField,
} from '@tiptap/core'
import { type Lexer, marked } from 'marked'

import {
  closeMarksBeforeNode,
  findMarksToClose,
  findMarksToCloseAtEnd,
  findMarksToOpen,
  reopenMarksAfterNode,
  wrapInMarkdownBlock,
} from './utils.js'

export class MarkdownManager {
  private markedInstance: typeof marked
  private lexer: Lexer
  private registry: Map<string, MarkdownExtensionSpec[]>
  private nodeTypeRegistry: Map<string, MarkdownExtensionSpec[]>
  private indentStyle: 'space' | 'tab'
  private indentSize: number

  /**
   * Create a MarkdownManager.
   * @param options.marked Optional marked instance to use (injected).
   * @param options.markedOptions Optional options to pass to marked.setOptions
   */
  constructor(options?: {
    marked?: typeof marked
    markedOptions?: Parameters<typeof marked.setOptions>[0]
    indentation?: { style?: 'space' | 'tab'; size?: number }
  }) {
    this.markedInstance = options?.marked ?? marked
    this.lexer = new this.markedInstance.Lexer()
    this.indentStyle = options?.indentation?.style ?? 'space'
    this.indentSize = options?.indentation?.size ?? 2

    if (options?.markedOptions && typeof this.markedInstance.setOptions === 'function') {
      this.markedInstance.setOptions(options.markedOptions)
    }

    this.registry = new Map()
    this.nodeTypeRegistry = new Map()
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
    const name = extension.name
    // Read the `markdown` object from the extension config. This allows
    // extensions to provide `markdown: { name?, parseName?, renderName?, parse?, render?, match? }`.
    const markdownCfg = getExtensionField(extension, 'markdown') ?? null

    if (!markdownCfg) {
      return
    }

    const parseMarkdown = markdownCfg?.parse ?? undefined
    const renderMarkdown = markdownCfg?.render ?? undefined
    const isIndenting = markdownCfg?.isIndenting ?? false
    const tokenizer = markdownCfg?.tokenizer ?? undefined

    // Support new parseName/renderName system while maintaining backward compatibility
    const parseName = markdownCfg.parseName ?? markdownCfg.name ?? name
    const renderName = markdownCfg.renderName ?? name
    const legacyMarkdownName = markdownCfg.name ?? name

    const spec: MarkdownExtensionSpec = {
      parseName,
      renderName,
      markdownName: legacyMarkdownName, // Keep for backward compatibility
      parseMarkdown,
      renderMarkdown,
      isIndenting,
      tokenizer,
    }

    // Add to parse registry using parseName
    if (parseName && parseMarkdown) {
      const parseExisting = this.registry.get(parseName) || []
      parseExisting.push(spec)
      this.registry.set(parseName, parseExisting)
    }

    // Add to render registry using renderName (node type)
    if (renderName && renderMarkdown) {
      const renderExisting = this.nodeTypeRegistry.get(renderName) || []
      renderExisting.push(spec)
      this.nodeTypeRegistry.set(renderName, renderExisting)
    }

    // Register custom tokenizer with marked.js
    if (tokenizer && this.hasMarked()) {
      this.registerTokenizer(tokenizer)
    }
  }

  /**
   * Register a custom tokenizer with marked.js for parsing non-standard markdown syntax.
   */
  private registerTokenizer(tokenizer: MarkdownTokenizer): void {
    if (!this.hasMarked()) {
      return
    }

    const { name, start, level = 'inline', tokenize } = tokenizer

    const tokenizeInline = (src: string) => {
      return this.lexer.inlineTokens(src)
    }

    const tokenizeBlock = (src: string) => {
      return this.lexer.blockTokens(src)
    }

    const helper = {
      inlineTokens: tokenizeInline,
      blockTokens: tokenizeBlock,
    }

    // Create marked.js extension with proper types
    const markedExtension: any = {
      name,
      level,
      start:
        start ??
        ((src: string) => {
          // For other tokenizers, try to find a match and return its position
          const result = tokenize(src, [], helper)
          if (result && result.raw) {
            const index = src.indexOf(result.raw)
            return index
          }
          return -1
        }),
      tokenizer: (src: string, tokens: any[]) => {
        const result = tokenize(src, tokens, helper)
        if (result && result.type) {
          return {
            type: result.type,
            raw: result.raw || '',
            ...result,
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

    // If an array of nodes was passed
    if (Array.isArray(docOrContent)) {
      return this.renderNodes(docOrContent, docOrContent)
    }

    // Single node
    return this.renderNodes(docOrContent, docOrContent)
  }

  /**
   * Parse markdown string into Tiptap JSON document using registered extension handlers.
   */
  parse(markdown: string): JSONContent {
    if (!this.hasMarked()) {
      throw new Error('No marked instance available for parsing')
    }

    // Use marked to tokenize the markdown
    const tokens = this.markedInstance.lexer(markdown)

    // Convert tokens to Tiptap JSON
    const content = this.parseTokens(tokens)

    // Return a document node containing the parsed content
    return {
      type: 'doc',
      content,
    }
  }

  /**
   * Convert an array of marked tokens into Tiptap JSON nodes using registered extension handlers.
   */
  private parseTokens(tokens: MarkdownToken[]): JSONContent[] {
    return tokens
      .map(token => this.parseToken(token))
      .filter((parsed): parsed is JSONContent | JSONContent[] => parsed !== null)
      .flatMap(parsed => (Array.isArray(parsed) ? parsed : [parsed]))
  }

  /**
   * Parse a single token into Tiptap JSON using the appropriate registered handler.
   */
  private parseToken(token: MarkdownToken): JSONContent | JSONContent[] | null {
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

  private lastParseResult: JSONContent | JSONContent[] | null = null

  /**
   * Create the helper functions that are passed to parse handlers.
   */
  private createParseHelpers(): MarkdownParseHelpers {
    return {
      parseInline: (tokens: MarkdownToken[]) => this.parseInlineTokens(tokens),
      parseChildren: (tokens: MarkdownToken[]) => this.parseTokens(tokens),
      createTextNode: (text: string, marks?: Array<{ type: string; attrs?: any }>) => ({
        type: 'text',
        text,
        marks: marks || undefined,
      }),
      createNode: (type: string, attrs?: any, content?: JSONContent[]) => ({
        type,
        attrs: attrs || undefined,
        content: content || undefined,
      }),
      applyMark: (markType: string, content: JSONContent[], attrs?: any) => ({
        mark: markType,
        content,
        attrs: attrs || undefined,
      }),
    }
  }

  /**
   * Parse inline tokens (bold, italic, links, etc.) into text nodes with marks.
   * This is the complex part that handles mark nesting and boundaries.
   */
  private parseInlineTokens(tokens: MarkdownToken[]): JSONContent[] {
    const result: JSONContent[] = []

    // Process tokens sequentially
    tokens.forEach(token => {
      if (token.type === 'text') {
        // Create text node
        result.push({
          type: 'text',
          text: token.text || '',
        })
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
    })

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
  private parseFallbackToken(token: MarkdownToken): JSONContent | JSONContent[] | null {
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
          text: token.text || '',
        }

      default:
        // Unknown token type - try to parse children if they exist
        if (token.tokens) {
          return this.parseTokens(token.tokens)
        }
        return null
    }
  }

  renderNodeToMarkdown(node: JSONContent, parentNode?: JSONContent, index = 0, level = 0): string {
    // if node is a text node, we simply return it's text content
    // marks are handled at the array level in renderNodesWithMarkBoundaries
    if (node.type === 'text') {
      return node.text || ''
    }

    if (!node.type) {
      return ''
    }

    // TODO: check what the default case should be in case
    // of unknown node types (return the HTML? Try to return child content at least?)
    const handler = this.getHandlerForToken(node.type)
    if (!handler) {
      return ''
    }

    // TODO: We need to add marks rendering as well

    const helpers: MarkdownRendererHelpers = {
      renderChildren: (nodes, separator) => {
        const childLevel = handler.isIndenting ? level + 1 : level

        if (!Array.isArray(nodes) && (nodes as any).content) {
          return this.renderNodes((nodes as any).content as JSONContent[], node, separator || '', index, childLevel)
        }

        return this.renderNodes(nodes, node, separator || '', index, childLevel)
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
      meta: {},
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

    nodes.forEach((node, i) => {
      // Lookahead to the next node to determine if marks need to be closed
      const nextNode = i < nodes.length - 1 ? nodes[i + 1] : null

      if (!node.type) {
        return
      }

      if (node.type === 'text') {
        let textContent = node.text || ''
        const currentMarks = new Map((node.marks || []).map(mark => [mark.type, mark]))

        // Find marks that need to be closed and opened
        const marksToClose = findMarksToClose(activeMarks, currentMarks)
        const marksToOpen = findMarksToOpen(activeMarks, currentMarks)

        // Close marks (in reverse order of how they were opened)
        marksToClose.forEach(markType => {
          const mark = activeMarks.get(markType)
          const closeMarkdown = this.getMarkClosing(markType, mark)
          if (closeMarkdown) {
            textContent += closeMarkdown
          }
          activeMarks.delete(markType)
        })

        // Open new marks (should be at the beginning)
        marksToOpen.forEach(({ type, mark }) => {
          const openMarkdown = this.getMarkOpening(type, mark)
          if (openMarkdown) {
            textContent = openMarkdown + textContent
          }
          activeMarks.set(type, mark)
        })

        // Close marks at the end of this node if needed
        const marksToCloseAtEnd = findMarksToCloseAtEnd(
          activeMarks,
          currentMarks,
          nextNode,
          this.markSetsEqual.bind(this),
        )

        marksToCloseAtEnd.forEach(markType => {
          const mark = activeMarks.get(markType)
          const closeMarkdown = this.getMarkClosing(markType, mark)
          if (closeMarkdown) {
            textContent += closeMarkdown
          }
          activeMarks.delete(markType)
        })

        result.push(textContent)
      } else {
        // For non-text nodes, close all active marks before rendering, then reopen after
        const marksToReopen = new Map(activeMarks)

        // Close all marks before the node
        const beforeMarkdown = closeMarksBeforeNode(activeMarks, this.getMarkClosing.bind(this))

        // Render the node
        const nodeContent = this.renderNodeToMarkdown(node, parentNode, i, level)

        // Reopen marks after the node
        const afterMarkdown = reopenMarksAfterNode(marksToReopen, activeMarks, this.getMarkOpening.bind(this))

        result.push(beforeMarkdown + nodeContent + afterMarkdown)
      }
    })

    return result.join(separator)
  }

  /**
   * Get the opening markdown syntax for a mark type.
   */
  private getMarkOpening(markType: string, mark: any): string {
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
          indent: (content: string) => content,
          wrapInBlock: (prefix: string, content: string) => prefix + content,
        },
        { index: 0, level: 0, parentType: 'text', meta: {} },
      )

      // Extract the opening part (everything before placeholder)
      const placeholderIndex = rendered.indexOf(placeholder)
      return placeholderIndex >= 0 ? rendered.substring(0, placeholderIndex) : ''
    } catch (err) {
      console.error('Failed to get mark opening for', markType, err)
      return ''
    }
  }

  /**
   * Get the closing markdown syntax for a mark type.
   */
  private getMarkClosing(markType: string, mark: any): string {
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
      console.error('Failed to get mark closing for', markType, err)
      return ''
    }
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
