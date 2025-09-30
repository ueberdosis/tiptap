import type { ExtendableMarkdownSpec, JSONContent, MarkdownToken } from '../../types.js'
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
export function createBlockMarkdownSpec(options: BlockMarkdownSpecOptions): ExtendableMarkdownSpec {
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
    parse: (token, h) => {
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

    tokenizer: {
      name: nodeName,
      level: 'block' as const,
      start(src) {
        const regex = new RegExp(`^:::${blockName}`, 'm')
        return src.match(regex)?.index
      },
      tokenize(src, _tokens, lexer) {
        const regex = new RegExp(`^:::${blockName}(?:\\s+\\{([^}]*)\\})?\\s*\\n([\\s\\S]*?)\\n:::`)
        const match = src.match(regex)

        if (!match) {
          return undefined
        }

        const [fullMatch, attrString = '', matchedContent] = match
        const attributes = parseAttributes(attrString)
        const trimmedContent = matchedContent.replace(/^\s*\n|\n\s*$/g, '').trim()

        let contentTokens: MarkdownToken[] = []
        if (trimmedContent) {
          if (content === 'block') {
            contentTokens = lexer.blockTokens(trimmedContent)

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
            contentTokens = lexer.inlineTokens(trimmedContent)
          }
        }

        return {
          type: nodeName,
          raw: fullMatch,
          attributes,
          // content: trimmedContent,
          tokens: contentTokens,
        }
      },
    },

    render: (node, h) => {
      const filteredAttrs = filterAttributes(node.attrs || {})
      const attrs = serializeAttributes(filteredAttrs)
      const attrString = attrs ? ` {${attrs}}` : ''
      const renderedContent = h.renderChildren(node.content || [], '\n')

      return `:::${blockName}${attrString}\n\n${renderedContent}\n\n:::`
    },
  }
}
