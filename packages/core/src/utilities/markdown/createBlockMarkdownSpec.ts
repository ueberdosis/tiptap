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
  getContent?: (node: any) => string
  /** Function to parse attributes from the attribute string */
  parseAttributes?: (attrString: string) => Record<string, any>
  /** Function to serialize attributes to string */
  serializeAttributes?: (attrs: Record<string, any>) => string
  /** Default attributes to apply when parsing */
  defaultAttributes?: Record<string, any>
  /** Content type: 'block' allows paragraphs/lists/etc, 'inline' only allows bold/italic/links/etc */
  content?: 'block' | 'inline'
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
 *   blockName: 'callout',
 *   parseAttributes: (attrStr) => parseAttributes(attrStr),
 *   serializeAttributes: (attrs) => serializeAttributes(attrs),
 *   defaultAttributes: { type: 'info' }
 * })
 *
 * // Usage in extension:
 * export const Callout = Node.create({
 *   // ... other config
 *   markdown: calloutSpec
 * })
 * ```
 */
export function createBlockMarkdownSpec(options: BlockMarkdownSpecOptions) {
  const {
    nodeName,
    name: markdownName,
    getContent,
    parseAttributes = defaultParseAttributes,
    serializeAttributes = defaultSerializeAttributes,
    defaultAttributes = {},
    content = 'block',
  } = options

  // Use markdownName for syntax, fallback to nodeName
  const blockName = markdownName || nodeName

  return {
    parse: (token: any, h: any) => {
      let nodeContent
      if (getContent) {
        nodeContent = getContent(token)
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
      start(src: string) {
        const regex = new RegExp(`^:::${blockName}`, 'm')
        return src.match(regex)?.index
      },
      tokenize(src: string, tokens: any[], lexer: any) {
        const regex = new RegExp(`^:::${blockName}(?:\\s+\\{([^}]*)\\})?\\s*\\n([\\s\\S]*?)\\n:::`)
        const match = src.match(regex)

        if (!match) {
          return undefined
        }

        const [fullMatch, attrString = '', matchedContent] = match
        const attributes = parseAttributes(attrString)
        const trimmedContent = matchedContent.replace(/^\s*\n|\n\s*$/g, '').trim()

        let contentTokens: any[] = []
        if (trimmedContent) {
          contentTokens = content === 'block' ? lexer.blockTokens(trimmedContent) : lexer.inlineTokens(trimmedContent)
        }

        if (content === 'block') {
          while (contentTokens.length > 0) {
            const lastToken = contentTokens[contentTokens.length - 1]
            if (lastToken.type === 'paragraph' && (!lastToken.text || lastToken.text.trim() === '')) {
              contentTokens.pop()
            } else {
              break
            }
          }

          contentTokens.forEach((token: any) => {
            if (token.type === 'paragraph' && token.text) {
              token.text = token.text.replace(/\n+$/, '')
            }
          })
        }

        return {
          type: nodeName,
          raw: fullMatch,
          attributes,
          content: trimmedContent,
          tokens: contentTokens,
        }
      },
    },

    render: (node: any, h: any) => {
      const attrs = serializeAttributes(node.attrs || {})
      const attrString = attrs ? ` {${attrs}}` : ''
      const renderedContent = h.renderChildren(node.content || [], '\n')

      return `:::${blockName}${attrString}\n${renderedContent}\n:::`
    },
  }
}
