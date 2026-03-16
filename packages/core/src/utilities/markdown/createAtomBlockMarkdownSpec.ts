import type {
  JSONContent,
  MarkdownParseHelpers,
  MarkdownParseResult,
  MarkdownToken,
  MarkdownTokenizer,
} from '../../types.js'
import {
  parseAttributes as defaultParseAttributes,
  serializeAttributes as defaultSerializeAttributes,
} from './attributeUtils.js'

export interface AtomBlockMarkdownSpecOptions {
  /** The Tiptap node name this spec is for */
  nodeName: string
  /** The markdown syntax name (defaults to nodeName if not provided) */
  name?: string
  /** Function to parse attributes from token attribute string */
  parseAttributes?: (attrString: string) => Record<string, any>
  /** Function to serialize attributes back to string for rendering */
  serializeAttributes?: (attrs: Record<string, any>) => string
  /** Default attributes to apply when parsing */
  defaultAttributes?: Record<string, any>
  /** Required attributes that must be present for successful parsing */
  requiredAttributes?: string[]
  /** Attributes that are allowed to be rendered back to markdown (whitelist) */
  allowedAttributes?: string[]
}

/**
 * Creates a complete markdown spec for atomic block nodes using Pandoc syntax.
 *
 * The generated spec handles:
 * - Parsing self-closing blocks with `:::blockName {attributes}`
 * - Extracting and parsing attributes
 * - Validating required attributes
 * - Rendering blocks back to markdown
 *
 * @param options - Configuration for the atomic block markdown spec
 * @returns Complete markdown specification object
 *
 * @example
 * ```ts
 * const youtubeSpec = createAtomBlockMarkdownSpec({
 *   nodeName: 'youtube',
 *   requiredAttributes: ['src'],
 *   defaultAttributes: { start: 0 },
 *   allowedAttributes: ['src', 'start', 'width', 'height'] // Only these get rendered to markdown
 * })
 *
 * // Usage in extension:
 * export const Youtube = Node.create({
 *   // ... other config
 *   markdown: youtubeSpec
 * })
 * ```
 */
export function createAtomBlockMarkdownSpec(options: AtomBlockMarkdownSpecOptions): {
  parseMarkdown: (token: MarkdownToken, h: MarkdownParseHelpers) => MarkdownParseResult
  markdownTokenizer: MarkdownTokenizer
  renderMarkdown: (node: JSONContent) => string
} {
  const {
    nodeName,
    name: markdownName,
    parseAttributes = defaultParseAttributes,
    serializeAttributes = defaultSerializeAttributes,
    defaultAttributes = {},
    requiredAttributes = [],
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
    parseMarkdown: (token: MarkdownToken, h: MarkdownParseHelpers) => {
      const attrs = { ...defaultAttributes, ...token.attributes }
      return h.createNode(nodeName, attrs, [])
    },

    markdownTokenizer: {
      name: nodeName,
      level: 'block' as const,
      start(src: string) {
        const regex = new RegExp(`^:::${blockName}(?:\\s|$)`, 'm')
        const index = src.match(regex)?.index
        return index !== undefined ? index : -1
      },
      tokenize(src, _tokens, _lexer) {
        // Use non-global regex to match from the start of the string
        // Include optional newline to ensure we consume the entire line
        const regex = new RegExp(`^:::${blockName}(?:\\s+\\{([^}]*)\\})?\\s*:::(?:\\n|$)`)
        const match = src.match(regex)

        if (!match) {
          return undefined
        }

        // Parse attributes if present
        const attrString = match[1] || ''
        const attributes = parseAttributes(attrString)

        // Validate required attributes
        const missingRequired = requiredAttributes.find(required => !(required in attributes))
        if (missingRequired) {
          return undefined
        }

        return {
          type: nodeName,
          raw: match[0],
          attributes,
        }
      },
    },

    renderMarkdown: node => {
      const filteredAttrs = filterAttributes(node.attrs || {})
      const attrs = serializeAttributes(filteredAttrs)
      const attrString = attrs ? ` {${attrs}}` : ''

      return `:::${blockName}${attrString} :::`
    },
  }
}
