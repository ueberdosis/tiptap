import {
  parseAttributes as defaultParseAttributes,
  serializeAttributes as defaultSerializeAttributes,
} from './attributeUtils.js'

export interface AtomBlockMarkdownSpecOptions {
  /** The block name/type used in the markdown syntax (e.g., "youtube", "image") */
  blockName: string
  /** Function to parse attributes from the attribute string */
  parseAttributes?: (attrString: string) => Record<string, any>
  /** Function to serialize attributes to string */
  serializeAttributes?: (attrs: Record<string, any>) => string
  /** Default attributes to apply when parsing */
  defaultAttributes?: Record<string, any>
  /** Required attributes that must be present */
  requiredAttributes?: string[]
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
 *   blockName: 'youtube',
 *   parseAttributes: (attrStr) => parseAttributes(attrStr),
 *   serializeAttributes: (attrs) => serializeAttributes(attrs),
 *   requiredAttributes: ['src'],
 *   defaultAttributes: { start: 0 }
 * })
 *
 * // Usage in extension:
 * export const Youtube = Node.create({
 *   // ... other config
 *   markdown: youtubeSpec
 * })
 * ```
 */
export function createAtomBlockMarkdownSpec(options: AtomBlockMarkdownSpecOptions) {
  const {
    blockName,
    parseAttributes = defaultParseAttributes,
    serializeAttributes = defaultSerializeAttributes,
    defaultAttributes = {},
    requiredAttributes = [],
  } = options

  return {
    parse: (token: any, h: any) => {
      const attrs = { ...defaultAttributes, ...token.attributes }
      return h.createNode(blockName, attrs, [])
    },

    tokenizer: {
      name: blockName,
      level: 'block',
      start(src: string) {
        const regex = new RegExp(`^:::${blockName}(?:\\s|$)`, 'm')
        return src.match(regex)?.index
      },
      tokenize(src: string) {
        // Use non-global regex to match from the start of the string
        // Include optional newline to ensure we consume the entire line
        const regex = new RegExp(`^:::${blockName}(?:\\s+\\{([^}]*)\\})?\\s*(?:\\n|$)`)
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
          type: blockName,
          raw: match[0],
          attributes,
        }
      },
    },

    render: (node: any) => {
      const attrs = serializeAttributes(node.attrs || {})
      const attrString = attrs ? ` {${attrs}}` : ''

      return `:::${blockName}${attrString}`
    },
  }
}
