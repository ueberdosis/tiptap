import type {
  JSONContent,
  MarkdownParseHelpers,
  MarkdownParseResult,
  MarkdownRendererHelpers,
  MarkdownToken,
  MarkdownTokenizer,
} from '../../types.js'
import {
  parseAttributes as defaultParseAttributes,
  serializeAttributes as defaultSerializeAttributes,
} from './attributeUtils.js'

export interface BlockMarkdownSpecOptions {
  /** The Tiptap node name this spec is for */
  nodeName: string
  /** The markdown syntax name (defaults to nodeName if not provided) */
  name?: string
  /** Function to extract content from the node for serialization */
  getContent?: (token: MarkdownToken) => string
  /** Function to parse attributes from the attribute string */
  parseAttributes?: (attrString: string) => Record<string, any>
  /** Function to serialize attributes to string */
  serializeAttributes?: (attrs: Record<string, any>) => string
  /** Default attributes to apply when parsing */
  defaultAttributes?: Record<string, any>
  /** Content type: 'block' allows paragraphs/lists/etc, 'inline' only allows bold/italic/links/etc */
  content?: 'block' | 'inline'
  /** Allowlist of attributes to include in markdown (if not provided, all attributes are included) */
  allowedAttributes?: string[]
}

/**
 * Creates a complete markdown spec for block-level nodes using Pandoc syntax.
 *
 * The generated spec handles:
 * - Parsing blocks with `:::blockName {attributes}` syntax
 * - Extracting and parsing attributes
 * - Rendering blocks back to markdown with proper formatting
 * - Nested content support
 *
 * @param options - Configuration for the block markdown spec
 * @returns Complete markdown specification object
 *
 * @example
 * ```ts
 * const calloutSpec = createBlockMarkdownSpec({
 *   nodeName: 'callout',
 *   defaultAttributes: { type: 'info' },
 *   allowedAttributes: ['type', 'title'] // Only these get rendered to markdown
 * })
 *
 * // Usage in extension:
 * export const Callout = Node.create({
 *   // ... other config
 *   markdown: calloutSpec
 * })
 * ```
 */
export function createBlockMarkdownSpec(options: BlockMarkdownSpecOptions): {
  parseMarkdown: (token: MarkdownToken, h: MarkdownParseHelpers) => MarkdownParseResult
  markdownTokenizer: MarkdownTokenizer
  renderMarkdown: (node: JSONContent, h: MarkdownRendererHelpers) => string
} {
  const {
    nodeName,
    name: markdownName,
    getContent,
    parseAttributes = defaultParseAttributes,
    serializeAttributes = defaultSerializeAttributes,
    defaultAttributes = {},
    content = 'block',
    allowedAttributes,
  } = options

  // Use markdownName for syntax, fallback to nodeName
  const blockName = markdownName || nodeName

  // Helper function to filter attributes based on allowlist
  const filterAttributes = (attrs: Record<string, any>) => {
    if (!allowedAttributes) {
      return attrs
    }

    const filtered: Record<string, any> = {}
    allowedAttributes.forEach(key => {
      if (key in attrs) {
        filtered[key] = attrs[key]
      }
    })
    return filtered
  }

  return {
    parseMarkdown: (token, h) => {
      let nodeContent: JSONContent[]

      if (getContent) {
        const contentResult = getContent(token)
        // If getContent returns a string, wrap it in a text node
        nodeContent = typeof contentResult === 'string' ? [{ type: 'text', text: contentResult }] : contentResult
      } else if (content === 'block') {
        nodeContent = h.parseChildren(token.tokens || [])
      } else {
        nodeContent = h.parseInline(token.tokens || [])
      }

      const attrs = { ...defaultAttributes, ...token.attributes }

      return h.createNode(nodeName, attrs, nodeContent)
    },

    markdownTokenizer: {
      name: nodeName,
      level: 'block' as const,
      start(src) {
        const regex = new RegExp(`^:::${blockName}`, 'm')
        const index = src.match(regex)?.index
        return index !== undefined ? index : -1
      },
      tokenize(src, _tokens, lexer) {
        // Match the opening tag with optional attributes
        const openingRegex = new RegExp(`^:::${blockName}(?:\\s+\\{([^}]*)\\})?\\s*\\n`)
        const openingMatch = src.match(openingRegex)

        if (!openingMatch) {
          return undefined
        }

        const [openingTag, attrString = ''] = openingMatch
        const attributes = parseAttributes(attrString)

        // Find the matching closing tag by tracking nesting level
        let level = 1
        const position = openingTag.length
        let matchedContent = ''

        // Pattern to match any block opening (:::word) or closing (:::)
        const blockPattern = /^:::([\w-]*)(\s.*)?/gm
        const remaining = src.slice(position)

        blockPattern.lastIndex = 0

        // run until no more matches are found
        for (;;) {
          const match = blockPattern.exec(remaining)
          if (match === null) {
            break
          }
          const matchPos = match.index
          const blockType = match[1] // Empty string for closing tag, block name for opening

          if (match[2]?.endsWith(':::')) {
            // this is an atom ::: node, we skip it
            continue
          }

          if (blockType) {
            // Opening tag found - increase level
            level += 1
          } else {
            // Closing tag found - decrease level
            level -= 1

            if (level === 0) {
              // Found our matching closing tag
              // Don't trim yet - keep newlines for tokenizer regex matching
              const rawContent = remaining.slice(0, matchPos)
              matchedContent = rawContent.trim()
              const fullMatch = src.slice(0, position + matchPos + match[0].length)

              // Tokenize the content
              let contentTokens: MarkdownToken[] = []
              if (matchedContent) {
                if (content === 'block') {
                  // Use rawContent for tokenization to preserve line boundaries for regex matching
                  contentTokens = lexer.blockTokens(rawContent)

                  // Parse inline tokens for any token that has text content but no tokens
                  contentTokens.forEach(token => {
                    if (token.text && (!token.tokens || token.tokens.length === 0)) {
                      token.tokens = lexer.inlineTokens(token.text)
                    }
                  })

                  // Clean up empty trailing paragraphs
                  while (contentTokens.length > 0) {
                    const lastToken = contentTokens[contentTokens.length - 1]
                    if (lastToken.type === 'paragraph' && (!lastToken.text || lastToken.text.trim() === '')) {
                      contentTokens.pop()
                    } else {
                      break
                    }
                  }
                } else {
                  contentTokens = lexer.inlineTokens(matchedContent)
                }
              }

              return {
                type: nodeName,
                raw: fullMatch,
                attributes,
                content: matchedContent,
                tokens: contentTokens,
              }
            }
          }
        }

        // No matching closing tag found
        return undefined
      },
    },

    renderMarkdown: (node, h) => {
      const filteredAttrs = filterAttributes(node.attrs || {})
      const attrs = serializeAttributes(filteredAttrs)
      const attrString = attrs ? ` {${attrs}}` : ''
      const renderedContent = h.renderChildren(node.content || [], '\n\n')

      return `:::${blockName}${attrString}\n\n${renderedContent}\n\n:::`
    },
  }
}
