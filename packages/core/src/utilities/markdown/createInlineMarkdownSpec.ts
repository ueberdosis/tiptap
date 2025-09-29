/**
 * Parse shortcode attributes like 'id="madonna" handle="john" name="John Doe"'
 * Requires all values to be quoted with either single or double quotes
 */
function parseShortcodeAttributes(attrString: string): Record<string, any> {
  if (!attrString.trim()) {
    return {}
  }

  const attributes: Record<string, any> = {}
  // Match key=value pairs, only accepting quoted values
  const regex = /(\w+)=(?:"([^"]*)"|'([^']*)')/g
  let match = regex.exec(attrString)

  while (match !== null) {
    const [, key, doubleQuoted, singleQuoted] = match
    attributes[key] = doubleQuoted || singleQuoted
    match = regex.exec(attrString)
  }

  return attributes
}

/**
 * Serialize attributes back to shortcode format
 * Always quotes all values with double quotes
 */
function serializeShortcodeAttributes(attrs: Record<string, any>): string {
  return Object.entries(attrs)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${key}="${value}"`)
    .join(' ')
}

export interface InlineMarkdownSpecOptions {
  /** The Tiptap node name this spec is for */
  nodeName: string
  /** The shortcode name (defaults to nodeName if not provided) */
  name?: string
  /** Function to extract content from the node for serialization */
  getContent?: (node: any) => string
  /** Function to parse attributes from the attribute string */
  parseAttributes?: (attrString: string) => Record<string, any>
  /** Function to serialize attributes to string */
  serializeAttributes?: (attrs: Record<string, any>) => string
  /** Default attributes to apply when parsing */
  defaultAttributes?: Record<string, any>
  /** Whether this is a self-closing shortcode (no content, like [emoji name=party]) */
  selfClosing?: boolean
}

/**
 * Creates a complete markdown spec for inline nodes using attribute syntax.
 *
 * The generated spec handles:
 * - Parsing shortcode syntax with `[nodeName attributes]content[/nodeName]` format
 * - Self-closing shortcodes like `[emoji name=party_popper]`
 * - Extracting and parsing attributes from the opening tag
 * - Rendering inline elements back to shortcode markdown
 * - Supporting both content-based and self-closing inline elements
 *
 * @param options - Configuration for the inline markdown spec
 * @returns Complete markdown specification object
 *
 * @example
 * ```ts
 * // Self-closing mention: [mention id="madonna" label="Madonna"]
 * const mentionSpec = createInlineMarkdownSpec({
 *   nodeName: 'mention',
 *   selfClosing: true,
 *   defaultAttributes: { type: 'user' }
 * })
 *
 * // Self-closing emoji: [emoji name="party_popper"]
 * const emojiSpec = createInlineMarkdownSpec({
 *   nodeName: 'emoji',
 *   selfClosing: true
 * })
 *
 * // With content: [highlight color="yellow"]text[/highlight]
 * const highlightSpec = createInlineMarkdownSpec({
 *   nodeName: 'highlight',
 *   selfClosing: false
 * })
 *
 * // Custom attribute parsing if needed
 * const customSpec = createInlineMarkdownSpec({
 *   nodeName: 'customNode',
 *   parseAttributes: (attrStr) => customParseLogic(attrStr),
 *   serializeAttributes: (attrs) => customSerializeLogic(attrs)
 * })
 *
 * // Usage in extension:
 * export const Mention = Node.create({
 *   name: 'mention', // Must match nodeName
 *   // ... other config
 *   markdown: mentionSpec
 * })
 * ```
 */
export function createInlineMarkdownSpec(options: InlineMarkdownSpecOptions) {
  const {
    nodeName,
    name: shortcodeName,
    getContent,
    parseAttributes = parseShortcodeAttributes,
    serializeAttributes = serializeShortcodeAttributes,
    defaultAttributes = {},
    selfClosing = false,
  } = options

  // Use shortcodeName for markdown syntax, fallback to nodeName
  const shortcode = shortcodeName || nodeName

  // Escape special regex characters in shortcode name
  const escapedShortcode = shortcode.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

  return {
    parse: (token: any, h: any) => {
      const attrs = { ...defaultAttributes, ...token.attributes }

      if (selfClosing) {
        // Self-closing nodes like mentions are atomic - no content
        return h.createNode(nodeName, attrs)
      }

      // Nodes with content
      const content = getContent ? getContent(token) : token.content || ''
      if (content) {
        return h.createNode(nodeName, attrs, [h.createNode('text', { text: content })])
      }
      return h.createNode(nodeName, attrs, [])
    },

    tokenizer: {
      name: nodeName,
      level: 'inline',
      start(src: string) {
        // Create a non-global version for finding the start position
        const startPattern = selfClosing
          ? new RegExp(`\\[${escapedShortcode}\\s*[^\\]]*\\]`)
          : new RegExp(`\\[${escapedShortcode}\\s*[^\\]]*\\][\\s\\S]*?\\[\\/${escapedShortcode}\\]`)

        const match = src.match(startPattern)
        return match?.index
      },
      tokenize(src: string) {
        // Use non-global regex to match from the start of the string
        const tokenPattern = selfClosing
          ? new RegExp(`^\\[${escapedShortcode}\\s*([^\\]]*)\\]`)
          : new RegExp(`^\\[${escapedShortcode}\\s*([^\\]]*)\\]([\\s\\S]*?)\\[\\/${escapedShortcode}\\]`)

        const match = src.match(tokenPattern)

        if (!match) {
          return undefined
        }

        let content = ''
        let attrString = ''

        if (selfClosing) {
          // Self-closing: [shortcode attr="value"]
          const [, attrs] = match
          attrString = attrs
        } else {
          // With content: [shortcode attr="value"]content[/shortcode]
          const [, attrs, contentMatch] = match
          attrString = attrs
          content = contentMatch || ''
        }

        // Parse attributes from the attribute string
        const attributes = parseAttributes(attrString.trim())

        return {
          type: nodeName,
          raw: match[0],
          content: content.trim(),
          attributes,
        }
      },
    },

    render: (node: any) => {
      const content = getContent ? getContent(node) : node.textContent || ''
      const attrs = serializeAttributes(node.attrs || {})
      const attrString = attrs ? ` ${attrs}` : ''

      if (selfClosing) {
        return `[${shortcode}${attrString}]`
      }

      return `[${shortcode}${attrString}]${content}[/${shortcode}]`
    },
  }
}
