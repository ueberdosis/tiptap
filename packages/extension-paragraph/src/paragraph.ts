import { mergeAttributes, Node } from '@tiptap/core'

export interface ParagraphOptions {
  /**
   * The HTML attributes for a paragraph node.
   * @default {}
   * @example { class: 'foo' }
   */
  HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    paragraph: {
      /**
       * Toggle a paragraph
       * @example editor.commands.toggleParagraph()
       */
      setParagraph: () => ReturnType
    }
  }
}

/**
 * Markdown marker for empty paragraphs to preserve blank lines.
 * Using &nbsp; (non-breaking space HTML entity) ensures the paragraph
 * is not collapsed by markdown parsers while remaining human-readable.
 */
const EMPTY_PARAGRAPH_MARKDOWN = '&nbsp;'

/**
 * Unicode character for non-breaking space (U+00A0).
 * Some markdown parsers may convert &nbsp; entities to this literal character.
 */
const NBSP_CHAR = '\u00A0'

/**
 * This extension allows you to create paragraphs.
 * @see https://www.tiptap.dev/api/nodes/paragraph
 */
export const Paragraph = Node.create<ParagraphOptions>({
  name: 'paragraph',

  priority: 1000,

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  group: 'block',

  content: 'inline*',

  parseHTML() {
    return [{ tag: 'p' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['p', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  },

  parseMarkdown: (token, helpers) => {
    const tokens = token.tokens || []

    // Special case: if paragraph contains only a single image token,
    // unwrap it to avoid nesting block elements incorrectly
    if (tokens.length === 1 && tokens[0].type === 'image') {
      // Parse the image token directly as a block element
      return helpers.parseChildren([tokens[0]])
    }

    // Parse the inline tokens
    const content = helpers.parseInline(tokens)

    // Special case: if paragraph contains only &nbsp; (non-breaking space),
    // treat it as an empty paragraph to preserve blank lines
    const hasExplicitEmptyParagraphMarker =
      tokens.length === 1 &&
      tokens[0].type === 'text' &&
      (tokens[0].raw === EMPTY_PARAGRAPH_MARKDOWN ||
        tokens[0].text === EMPTY_PARAGRAPH_MARKDOWN ||
        tokens[0].raw === NBSP_CHAR ||
        tokens[0].text === NBSP_CHAR)

    if (
      hasExplicitEmptyParagraphMarker &&
      content.length === 1 &&
      content[0].type === 'text' &&
      (content[0].text === EMPTY_PARAGRAPH_MARKDOWN || content[0].text === NBSP_CHAR)
    ) {
      return helpers.createNode('paragraph', undefined, [])
    }

    // Convert 'paragraph' token to paragraph node
    return helpers.createNode('paragraph', undefined, content)
  },

  renderMarkdown: (node, h, ctx) => {
    if (!node) {
      return ''
    }

    // Normalize content: treat undefined/null as empty array
    const content = Array.isArray(node.content) ? node.content : []

    if (content.length === 0) {
      // Emit &nbsp; for the second and later empty paragraphs in a consecutive
      // run at the current nesting level. The first empty paragraph stays empty
      // so markdown spacing is preserved naturally.
      const previousContent = Array.isArray(ctx?.previousNode?.content) ? ctx.previousNode.content : []
      const previousNodeIsEmptyParagraph = ctx?.previousNode?.type === 'paragraph' && previousContent.length === 0

      return previousNodeIsEmptyParagraph ? EMPTY_PARAGRAPH_MARKDOWN : ''
    }

    return h.renderChildren(content)
  },

  addCommands() {
    return {
      setParagraph:
        () =>
        ({ commands }) => {
          return commands.setNode(this.name)
        },
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Alt-0': () => this.editor.commands.setParagraph(),
    }
  },
})
