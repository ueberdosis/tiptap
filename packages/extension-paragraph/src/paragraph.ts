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

  markdown: {
    // Minimal token shape passed to parser-level handlers. Note the
    // difference between tokenizer-level `parse(match: RegExpExecArray)`
    // (used to produce tokens) and parser-level `parse(token)` (this
    // handler), which receives a token object.
    //
    // Handler contract: (token: { type?, raw?, text?, tokens? }) => JSONContent | JSONContent[] | { mark, content }
    parse: token => {
      const children = Array.isArray(token.tokens)
        ? token.tokens.map((t: any) => ({ type: 'text', text: t.text ?? t.raw ?? '' }))
        : [{ type: 'text', text: token.text ?? token.raw ?? '' }]

      return { type: 'paragraph', content: children }
    },

    render: (node: any) => {
      if (!node || !Array.isArray(node.content)) {
        return `\n\n`
      }
      const inner = node.content.map((n: any) => (n && typeof n.text === 'string' ? n.text : '')).join('')
      return `${inner}\n\n`
    },
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
