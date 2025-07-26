import { mergeAttributes, Node, nodeInputRule } from '@tiptap/core'

export interface InlineMathOptions {
  /**
   * The HTML attributes applied to the inline math element.
   * @default {}
   */
  HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    inlineMathWebKit: {
      /**
       * Set an inline math node
       */
      setInlineMathWebKit: (options?: { src: string }) => ReturnType
    }
  }
}

/**
 * Regular expression for inline math input rules.
 * Matches single dollar signs with content, avoiding lookbehind for WebKit compatibility.
 * Pattern: (^|[^$])$([^$]+)$(?!$)
 * - (^|[^$]): Start of string or any character that's not a dollar sign
 * - $([^$]+)$: Dollar sign, content (captured), dollar sign
 * - (?!$): Not followed by another dollar sign (negative lookahead)
 */
export const inlineMathInputRegex = /(^|[^$])\$([^$]+)\$(?!\$)/

/**
 * This extension allows you to create inline math expressions.
 */
export const InlineMath = Node.create<InlineMathOptions>({
  name: 'inlineMath',

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  inline: true,

  group: 'inline',

  content: 'text*',

  marks: '',

  atom: true,

  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: element => element.getAttribute('data-src'),
        renderHTML: attributes => ({
          'data-src': attributes.src,
        }),
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-type="inline-math"]',
      },
    ]
  },

  renderHTML({ HTMLAttributes, node }) {
    return [
      'span',
      mergeAttributes(
        {
          'data-type': 'inline-math',
        },
        this.options.HTMLAttributes,
        HTMLAttributes,
      ),
      node.attrs.src || '',
    ]
  },

  addCommands() {
    return {
      setInlineMathWebKit:
        (options = { src: '' }) =>
        ({ commands }: { commands: any }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          })
        },
    }
  },

  addInputRules() {
    return [
      nodeInputRule({
        find: inlineMathInputRegex,
        type: this.type,
        getAttributes: match => ({
          src: match[2], // The captured content between dollar signs
        }),
      }),
    ]
  },
})

export default InlineMath
