import {
  type AnyExtension,
  type ExtendableConfig,
  type JSONContent,
  type MarkdownExtensionSpec,
  type MarkdownLexerConfiguration,
  type MarkdownParseHelpers,
  type MarkdownRendererHelpers,
  type MarkdownToken,
  type MarkdownTokenizer,
  type RenderContext,
  attrsEqual,
  callOrReturn,
  decodeHtmlEntities,
  encodeHtmlEntities,
  flattenExtensions,
  generateJSON,
  getExtensionField,
  getSchema,
  sortExtensions,
} from '@tiptap/core'
import { type Lexer, type Token, type TokenizerExtension, type TokenizerThis, marked } from 'marked'

import { htmlContainsUnrecognizedTag } from './utils/htmlTagDetection.js'
import { applyMarkToContent } from './utils/applyMarkToContent.js'
import { closeMarksBeforeNode } from './utils/closeMarksBeforeNode.js'
import { createImplicitEmptyParagraphsFromSpace } from './utils/createImplicitEmptyParagraphsFromSpace.js'
import { createParseHelpers } from './utils/createParseHelpers.js'
import { escapeMarkdownSyntax } from './utils/escapeMarkdownSyntax.js'
import { extractAbsorbedBlankLines } from './utils/extractAbsorbedBlankLines.js'
import { extractLeadingWhitespace } from './utils/extractLeadingWhitespace.js'
import { extractTrailingWhitespace } from './utils/extractTrailingWhitespace.js'
import { findMarksToClose } from './utils/findMarksToClose.js'
import { findMarksToCloseAtEnd } from './utils/findMarksToCloseAtEnd.js'
import { findMarksToOpen } from './utils/findMarksToOpen.js'
import { findSplitHtmlFragment } from './utils/findSplitHtmlFragment.js'
import { getHtmlTagInfo } from './utils/getHtmlTagInfo.js'
import { groupListItemsByType } from './utils/groupListItemsByType.js'
import { htmlAsLiteralText } from './utils/htmlAsLiteralText.js'
import { isEmptyOutput } from './utils/isEmptyOutput.js'
import { isMarkResult } from './utils/isMarkResult.js'
import { isTaskItem } from './utils/isTaskItem.js'
import { mergeAdjacentTextNodes } from './utils/mergeAdjacentTextNodes.js'
import { normalizeParseResult } from './utils/normalizeParseResult.js'
import { renderSyntheticMark } from './utils/renderSyntheticMark.js'
import { reopenMarksAfterNode } from './utils/reopenMarksAfterNode.js'
import { wrapInMarkdownBlock } from './utils/wrapInMarkdownBlock.js'

function isNonEmptyParseResult(result: JSONContent | JSONContent[] | null): boolean {
  return !!result && (!Array.isArray(result) || result.length > 0)
}

export class MarkdownManager {
  private markedInstance: typeof marked
  private activeParseLexer: Lexer | null = null
  private registry: Map<string, MarkdownExtensionSpec[]>
  private nodeTypeRegistry: Map<string, MarkdownExtensionSpec[]>
  /**
   * Extension registration order, used to resolve mark nesting deterministically.
   */
  private extensionRanks: Map<string, number> = new Map()
  private indentStyle: 'space' | 'tab'
  private indentSize: number
  private baseExtensions: AnyExtension[] = []
  private extensions: AnyExtension[] = []
  /** Set of extension names whose `code` spec property is truthy (nodes and marks). */
  private codeTypes: Set<string> = new Set()
  /** Lazy cache of tag names declared by the registered schema's parseDOM rules. */
  private schemaParseDomTagsCache: Set<string> | null = null
  /** Lazy cache of the names of the schema's inline node types. */
  private inlineNodeTypesCache: Set<string> | null = null

  /**
   * Create a MarkdownManager.
   * @param options.marked Optional marked instance to use (injected).
   * @param options.markedOptions Optional options to pass to marked.setOptions.
   * @param options.indentation Indentation settings (style and size).
   * @param options.extensions Extensions to register for markdown parsing and rendering.
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

    // Register extensions in Tiptap priority order so ranks match mark nesting.
    if (options?.extensions) {
      this.baseExtensions = options.extensions
      const flattened = sortExtensions(flattenExtensions(options.extensions))
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
   * Register a Tiptap extension's markdown handlers.
   */
  registerExtension(extension: AnyExtension): void {
    // Keep track of all extensions for HTML parsing
    this.extensions.push(extension)

    // Track `code: true` extensions so entity encoding is skipped inside code contexts.
    const isCode = callOrReturn(getExtensionField(extension, 'code'))

    const name = extension.name

    if (isCode) {
      this.codeTypes.add(name)
    }

    if (!this.extensionRanks.has(name)) {
      this.extensionRanks.set(name, this.extensionRanks.size)
    }
    const tokenName =
      (getExtensionField(
        extension,
        'markdownTokenName',
      ) as ExtendableConfig['markdownTokenName']) || name
    const parseMarkdown = getExtensionField(extension, 'parseMarkdown') as
      | ExtendableConfig['parseMarkdown']
      | undefined
    const renderMarkdown = getExtensionField(extension, 'renderMarkdown') as
      | ExtendableConfig['renderMarkdown']
      | undefined
    const tokenizer = getExtensionField(extension, 'markdownTokenizer') as
      | ExtendableConfig['markdownTokenizer']
      | undefined

    // Read the `markdown` options object from the extension config.
    const markdownCfg = (getExtensionField(extension, 'markdownOptions') ??
      null) as ExtendableConfig['markdownOptions']
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
    // Pass the instance's defaults so the lexer keeps its `use()`-registered tokenizers.
    return new this.markedInstance.Lexer(this.markedInstance.defaults)
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
        const helper = this.lexer
          ? createTokenizerHelpers(this.lexer)
          : createTokenizerHelpers(createLexer())
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
   * Serialize a JSON document to a Markdown string.
   */
  serialize(docOrContent: JSONContent): string {
    if (!docOrContent) {
      return ''
    }

    const result = this.renderNodes(docOrContent, docOrContent)
    // Return empty string if result is only whitespace entities or non-breaking spaces
    return isEmptyOutput(result) ? '' : result
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
  private parseTokens(
    tokens: MarkdownToken[],
    parseImplicitEmptyParagraphs = false,
  ): JSONContent[] {
    // Normalize absorbed blank lines into `space` tokens so they survive round-trips.
    const normalizedTokens = parseImplicitEmptyParagraphs
      ? extractAbsorbedBlankLines(tokens)
      : tokens

    const nonSpaceTokenIndexes = normalizedTokens.reduce<number[]>((indexes, token, index) => {
      if (token.type !== 'space') {
        indexes.push(index)
      }

      return indexes
    }, [])

    let previousNonSpaceTokenIndex = -1
    let nextNonSpaceTokenPointer = 0

    return normalizedTokens.flatMap((token, index) => {
      while (
        nextNonSpaceTokenPointer < nonSpaceTokenIndexes.length &&
        nonSpaceTokenIndexes[nextNonSpaceTokenPointer] < index
      ) {
        previousNonSpaceTokenIndex = nonSpaceTokenIndexes[nextNonSpaceTokenPointer]
        nextNonSpaceTokenPointer += 1
      }

      if (parseImplicitEmptyParagraphs && token.type === 'space') {
        const nextNonSpaceTokenIndex = nonSpaceTokenIndexes[nextNonSpaceTokenPointer] ?? -1

        return createImplicitEmptyParagraphsFromSpace(
          token,
          previousNonSpaceTokenIndex,
          nextNonSpaceTokenIndex,
        )
      }

      const parsed = this.parseToken(token, parseImplicitEmptyParagraphs)

      if (parsed === null) {
        return []
      }

      return Array.isArray(parsed) ? parsed : [parsed]
    })
  }

  /**
   * Parse a single token into Tiptap JSON using the appropriate registered handler.
   */
  private parseToken(
    token: MarkdownToken,
    parseImplicitEmptyParagraphs = false,
  ): JSONContent | JSONContent[] | null {
    if (!token.type) {
      return null
    }

    // Special handling for 'list' tokens that may contain mixed bullet/task items
    if (token.type === 'list') {
      return this.parseListToken(token)
    }

    return (
      this.findParseHandler(token) ?? this.parseFallbackToken(token, parseImplicitEmptyParagraphs)
    )
  }

  /**
   * Try each registered handler for a token type until one returns a valid result.
   */
  private findParseHandler(token: MarkdownToken): JSONContent | JSONContent[] | null {
    if (!token.type) {
      return null
    }

    const handlers = this.getHandlersForToken(token.type)
    const helpers = this.createParseHelpers()

    for (const handler of handlers) {
      if (!handler.parseMarkdown) {
        continue
      }

      const normalized = normalizeParseResult(handler.parseMarkdown(token, helpers))

      if (isNonEmptyParseResult(normalized)) {
        return normalized
      }
    }

    return null
  }

  /**
   * Parse a list token, splitting mixed bullet and task items into separate lists.
   * @param token The list token to parse.
   * @returns Array of parsed list nodes, or null when parsing fails.
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
    const groups = groupListItemsByType(
      token.items,
      src => this.markedInstance.lexer(src),
      src => this.tokenizeInline(src),
    )

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
    return this.findParseHandler(token) ?? this.parseFallbackToken(token)
  }

  /**
   * Creates the helpers passed to extension parse handlers.
   * @returns The markdown parse helpers.
   */
  private createParseHelpers(): MarkdownParseHelpers {
    return createParseHelpers({
      parseInline: (tokens: MarkdownToken[]) => this.parseInlineTokens(tokens),
      tokenizeInline: (src: string) => this.tokenizeInline(src),
      parseChildren: (tokens: MarkdownToken[]) => this.parseTokens(tokens),
      parseBlockChildren: (tokens: MarkdownToken[]) => this.parseTokens(tokens, true),
    })
  }

  /**
   * Parse inline tokens into text nodes with marks.
   */
  private parseInlineTokens(tokens: MarkdownToken[]): JSONContent[] {
    const result: JSONContent[] = []

    // Lookahead across tokens to merge split inline HTML fragments.
    for (let i = 0; i < tokens.length; i += 1) {
      const token = tokens[i]

      if (token.type === 'text') {
        // Create text node – decode HTML entities so that e.g. `&lt;` displays as `<` in the editor
        result.push({
          type: 'text',
          text: decodeHtmlEntities(token.text || ''),
        })
      } else if (token.type === 'escape') {
        // Backslash-escaped character: produce a text node with the escaped character
        result.push({
          type: 'text',
          text: token.text || '',
        })
      } else if (token.type === 'html') {
        // Handle possible split inline HTML by attempting to detect an
        // opening tag and searching forward for a matching closing tag.
        const raw = (token.raw ?? token.text ?? '').toString()
        const { isClosing, isSelfClosing, tagName } = getHtmlTagInfo(raw)

        if (!isClosing && tagName && !isSelfClosing) {
          const fragment = findSplitHtmlFragment(tokens, i, tagName, raw)

          if (fragment) {
            // Merge opening + inner + closing into one html fragment and parse
            const mergedToken = {
              type: 'html',
              raw: fragment.mergedRaw,
              text: fragment.mergedRaw,
              block: false,
            } as unknown as MarkdownToken

            const parsed = this.parseHTMLToken(mergedToken)
            if (parsed) {
              const normalized = normalizeParseResult(parsed as any)
              if (Array.isArray(normalized)) {
                result.push(...normalized)
              } else if (normalized) {
                result.push(normalized)
              }
            }

            // Advance i to the closing token
            i = fragment.closingIndex
            continue
          }
        }

        // Fallback: single html token parse
        const parsedSingle = this.parseHTMLToken(token)
        if (parsedSingle) {
          const normalized = normalizeParseResult(parsedSingle as any)
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

          if (isMarkResult(parsed)) {
            // This is a mark result - apply the mark to the content
            const markedContent = applyMarkToContent(parsed.mark, parsed.content, parsed.attrs)
            result.push(...markedContent)
          } else {
            // Regular inline node
            const normalized = normalizeParseResult(parsed)
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

    return mergeAdjacentTextNodes(result)
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

      // handle Marked escape tokens as literal text (e.g. backslash-escaped characters)
      case 'escape':
        return {
          type: 'text',
          text: token.text || '',
        }

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
   * Parse an HTML token with the extensions' parseHTML rules, falling back to literal text.
   * @param token Marked HTML token (block or inline).
   * @example
   *   parseHTMLToken({ type: 'html', raw: '<em>hi</em>', block: false })
   *   // → text node with an italic mark
   */
  private parseHTMLToken(token: MarkdownToken): JSONContent | JSONContent[] | null {
    const html = token.text || token.raw || ''

    if (!html.trim()) {
      return null
    }

    // Keep unrecognized HTML as literal text instead of dropping it.
    if (this.isUnrecognizedHtml(html)) {
      return htmlAsLiteralText(html, !!token.block)
    }

    // generateJSON requires window.DOMParser – treat recognized HTML as literal on the server
    if (typeof window === 'undefined' || typeof window.DOMParser === 'undefined') {
      return htmlAsLiteralText(html, !!token.block)
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

        const inlineContent = this.toInlineContent(parsed.content)

        return inlineContent.length > 0 ? inlineContent : null
      }

      return parsed as JSONContent
    } catch (error) {
      throw new Error(`Failed to parse HTML in markdown: ${error}`)
    }
  }

  /**
   * Keep only the inline nodes of parsed HTML content.
   * @param content Content array of a parsed HTML fragment.
   * @example
   *   toInlineContent([{ type: 'paragraph', content: [{ type: 'text', text: 'hi' }] }])
   *   // → [{ type: 'text', text: 'hi' }]
   */
  private toInlineContent(content: JSONContent[]): JSONContent[] {
    const inlineTypes = this.getInlineNodeTypes()

    return content.flatMap(node => {
      if (node.type && inlineTypes.has(node.type)) {
        return [node]
      }

      return node.content ? this.toInlineContent(node.content) : []
    })
  }

  /**
   * Names of the schema's inline node types, cached after registration.
   * @example
   *   getInlineNodeTypes().has('text') // → true
   */
  private getInlineNodeTypes(): Set<string> {
    if (this.inlineNodeTypesCache) {
      return this.inlineNodeTypesCache
    }

    const types = new Set<string>(['text'])

    try {
      const schema = getSchema(this.baseExtensions)

      Object.values(schema.nodes).forEach(type => {
        if (type.isInline) {
          types.add(type.name)
        }
      })
    } catch {
      // If schema construction fails, only text nodes count as inline.
    }

    this.inlineNodeTypesCache = types
    return types
  }

  /**
   * True when the HTML has a tag outside the standard set and the extensions' parseDOM rules.
   * @param html Raw HTML string from a marked token.
   * @example
   *   isUnrecognizedHtml('<enter foo bar>')  // → true
   *   isUnrecognizedHtml('<em>hi</em>')      // → false
   */
  private isUnrecognizedHtml(html: string): boolean {
    return htmlContainsUnrecognizedTag(html, this.getSchemaParseDomTags())
  }

  /**
   * Tag names declared in the extensions' parseDOM rules, cached after registration.
   * @example
   *   // After registering an extension with parseDOM [{ tag: 'something' }]
   *   getSchemaParseDomTags().has('something') // → true
   */
  private getSchemaParseDomTags(): Set<string> {
    if (this.schemaParseDomTagsCache) {
      return this.schemaParseDomTagsCache
    }

    const tags = new Set<string>()

    try {
      const schema = getSchema(this.baseExtensions)

      const collect = (spec: any) => {
        const parseDOM = spec?.parseDOM
        if (!Array.isArray(parseDOM)) {
          return
        }
        parseDOM.forEach((rule: any) => {
          if (typeof rule?.tag === 'string') {
            // Extract the bare tag name from selectors like "something.example"
            const match = rule.tag.match(/^[a-zA-Z][\w-]*/)
            if (match) {
              tags.add(match[0].toLowerCase())
            }
          }
        })
      }

      Object.values(schema.nodes).forEach(type => collect((type as any).spec))
      Object.values(schema.marks).forEach(type => collect((type as any).spec))
    } catch {
      // If schema construction fails, leave the set empty – detection then
      // falls back to the standard HTML tag list only.
    }

    this.schemaParseDomTagsCache = tags
    return tags
  }

  /**
   * Encode HTML entities and escape markdown syntax, except inside code contexts.
   */
  private encodeTextForMarkdown(text: string, node: JSONContent, parentNode?: JSONContent): string {
    const isInsideCode =
      (parentNode?.type != null && this.codeTypes.has(parentNode.type)) ||
      (node.marks || []).some(m => this.codeTypes.has(typeof m === 'string' ? m : m.type))

    if (isInsideCode) {
      return text
    }

    return escapeMarkdownSyntax(encodeHtmlEntities(text))
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

    const previousNode =
      Array.isArray(parentNode?.content) && index > 0 ? parentNode.content[index - 1] : undefined
    const helpers: MarkdownRendererHelpers = {
      renderChildren: (nodes, separator) => {
        const childLevel = handler.isIndenting ? level + 1 : level

        if (!Array.isArray(nodes) && (nodes as any).content) {
          return this.renderNodes(
            (nodes as any).content as JSONContent[],
            node,
            separator || '',
            index,
            childLevel,
          )
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
   * Render a node or array of nodes to a Markdown string.
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
   * Render nodes while tracking marks that span across text nodes.
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
        const marksToOpen = this.getMarksToOpenForSerialization(activeMarks, currentMarks, nextNode)
        const marksToClose = findMarksToClose(currentMarks, nextNode)

        // When marks close and open on the same node, defer the closings to the
        // end so delimiters stay properly nested.
        const activeMarksClosingHere = marksToClose.filter(markType => activeMarks.has(markType))
        const hasCrossedBoundary = activeMarksClosingHere.length > 0 && marksToOpen.length > 0

        let middleTrailingWhitespace = ''

        if (marksToClose.length > 0 && !hasCrossedBoundary) {
          // Extract trailing whitespace before closing marks to prevent invalid markdown like "**text **"
          const { text: trimmedText, whitespace } = extractTrailingWhitespace(textContent)
          middleTrailingWhitespace = whitespace
          textContent = trimmedText
        }

        if (!hasCrossedBoundary) {
          // Normal path: close marks that are ending here (no new marks opening simultaneously).
          // Reverse so the last-opened mark closes first (LIFO), preserving valid nesting.
          marksToClose
            .slice()
            .reverse()
            .forEach(markType => {
              if (!activeMarks.has(markType)) {
                return
              }

              const mark = currentMarks.get(markType)
              const closeMarkdown = this.getMarkClosing(
                markType,
                mark,
                markOpeningModes.get(markType),
              )
              if (closeMarkdown) {
                textContent += closeMarkdown
              }
              if (activeMarks.has(markType)) {
                activeMarks.delete(markType)
                markOpeningModes.delete(markType)
              }
            })
        }

        // Prepend opening delimiters, keeping leading whitespace outside them.
        let leadingWhitespace = ''
        if (marksToOpen.length > 0) {
          const { text: trimmedText, whitespace } = extractLeadingWhitespace(textContent)
          leadingWhitespace = whitespace
          textContent = trimmedText
        }

        // Snapshot active marks so each new delimiter excludes itself.
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

        // On a crossed boundary, close new marks (inner) first, then old marks (outer).
        let marksToCloseAtEnd: string[]
        if (hasCrossedBoundary) {
          const nextMarkTypes = new Set((nextNode?.marks || []).map((mark: any) => mark.type))

          marksToOpen.forEach(({ type }) => {
            if (nextMarkTypes.has(type) && this.getHtmlReopenTags(type)) {
              reopenWithHtmlOnNextOpen.add(type)
            }
          })

          // Close previously-active marks LIFO (innermost first).
          const activeMarkKeys = Array.from(activeMarks.keys())
          const activeMarksClosingHereLifo = activeMarksClosingHere
            .slice()
            .sort((a, b) => activeMarkKeys.indexOf(b) - activeMarkKeys.indexOf(a))

          marksToCloseAtEnd = [
            ...marksToOpen.map(m => m.type), // inner (opened here) — close first
            ...activeMarksClosingHereLifo, // outer (were active before) — close last, LIFO
          ]
        } else {
          marksToCloseAtEnd = findMarksToCloseAtEnd(
            activeMarks,
            currentMarks,
            nextNode,
            this.markSetsEqual.bind(this),
          )
        }

        // Extract trailing whitespace before closing marks to prevent invalid markdown like "**text **"
        let trailingWhitespace = ''
        if (marksToCloseAtEnd.length > 0) {
          const { text: trimmedText, whitespace } = extractTrailingWhitespace(textContent)
          trailingWhitespace = whitespace
          textContent = trimmedText
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
        // Only reopen marks that the node itself carries — marks don't skip over inline atoms.
        const nodeMarkTypes = new Set((node.marks || []).map((mark: { type: string }) => mark.type))
        const marksToReopen = new Map<string, { type: string; attrs?: Record<string, any> }>()
        const openingModesToReopen = new Map<string, 'markdown' | 'html'>()
        activeMarks.forEach((mark, type) => {
          if (nodeMarkTypes.has(type)) {
            marksToReopen.set(type, mark)
            openingModesToReopen.set(type, markOpeningModes.get(type) ?? 'markdown')
          }
        })

        // Close all marks before the node
        const beforeMarkdown = closeMarksBeforeNode(activeMarks, (markType, mark) => {
          return this.getMarkClosing(markType, mark, markOpeningModes.get(markType))
        })
        markOpeningModes.clear()

        // Render the node
        const nodeContent = this.renderNodeToMarkdown(node, parentNode, i, level)

        // Reopen marks after the node, except after a hard break.
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
  private getMarkOpening(
    markType: string,
    mark: any,
    openingMode: 'markdown' | 'html' = 'markdown',
  ): string {
    if (openingMode === 'html') {
      return this.getHtmlReopenTags(markType)?.open || ''
    }

    const handler = this.getHandlerForMark(markType)
    if (!handler?.renderMarkdown) {
      return ''
    }

    return renderSyntheticMark(handler.renderMarkdown, markType, mark.attrs || {}, 'open')
  }

  /**
   * Get the closing markdown syntax for a mark type.
   */
  private getMarkClosing(
    markType: string,
    mark: any,
    openingMode: 'markdown' | 'html' = 'markdown',
  ): string {
    if (openingMode === 'html') {
      return this.getHtmlReopenTags(markType)?.close || ''
    }

    const handler = this.getHandlerForMark(markType)
    if (!handler?.renderMarkdown) {
      return ''
    }

    return renderSyntheticMark(handler.renderMarkdown, markType, mark.attrs || {}, 'close')
  }

  /** Get the first render handler for a mark type (for backwards compatibility). */
  private getHandlerForMark(markType: string): MarkdownExtensionSpec | undefined {
    const handlers = this.getHandlersForNodeType(markType)
    return handlers.length > 0 ? handlers[0] : undefined
  }

  /**
   * HTML reopen tags for a mark, when it opted into HTML reopen mode.
   */
  private getHtmlReopenTags(markType: string): { open: string; close: string } | undefined {
    const handlers = this.getHandlersForNodeType(markType)
    const handler = handlers.length > 0 ? handlers[0] : undefined

    return handler?.htmlReopen
  }

  /**
   * Check if two mark sets are equal (same types and matching attributes).
   */
  private markSetsEqual(marks1: Map<string, any>, marks2: Map<string, any>): boolean {
    if (marks1.size !== marks2.size) {
      return false
    }

    return Array.from(marks1.entries()).every(([type, mark]) => {
      const otherMark = marks2.get(type)
      return otherMark && attrsEqual(mark.attrs, otherMark.attrs)
    })
  }

  /**
   * Order marks so delimiters nest: ending marks inner, higher-ranked marks outer.
   */
  private getMarksToOpenForSerialization(
    activeMarks: Map<string, any>,
    currentMarks: Map<string, any>,
    nextNode: any,
  ) {
    const marksToOpen = findMarksToOpen(activeMarks, currentMarks)

    if (marksToOpen.length <= 1) {
      return marksToOpen
    }

    const nextMarks = nextNode?.marks || []

    // Marks continue only when the next node has the same type and attrs.
    const continuesInNextNode = (markType: string, attrs: any) =>
      nextMarks.some((m: any) => m.type === markType && attrsEqual(m.attrs, attrs))

    // Higher rank sorts inner; unregistered marks fall back to innermost.
    const byRankInnerFirst = (a: { type: string }, b: { type: string }) => {
      const rankA = this.extensionRanks.get(a.type) ?? Number.MAX_SAFE_INTEGER
      const rankB = this.extensionRanks.get(b.type) ?? Number.MAX_SAFE_INTEGER

      if (rankA !== rankB) {
        return rankB - rankA
      }

      return a.type.localeCompare(b.type)
    }

    const endingHere = marksToOpen
      .filter(mark => !continuesInNextNode(mark.type, mark.mark.attrs))
      .sort(byRankInnerFirst)
    const continuing = marksToOpen
      .filter(mark => continuesInNextNode(mark.type, mark.mark.attrs))
      .sort(byRankInnerFirst)

    return [...endingHere, ...continuing]
  }
}

export default MarkdownManager
