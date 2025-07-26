import { mergeAttributes, Node, textblockTypeInputRule } from '@tiptap/core'

export interface BlockMathOptions {
  /**
   * The HTML attributes applied to the block math element.
   * @default {}
   */
  HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    blockMathWebKit: {
      /**
       * Set a block math node
       */
      setBlockMathWebKit: (options?: { src: string }) => ReturnType
    }
  }
}

/**
 * Regular expression for block math input rules.
 * Matches double dollar signs with content, avoiding lookbehind for WebKit compatibility.
 * Pattern: (^|[^$])$$([^$]+)$$(?!$)
 * - (^|[^$]): Start of string or any character that's not a dollar sign
 * - $$([^$]+)$$: Double dollar sign, content (captured), double dollar sign
 * - (?!$): Not followed by another dollar sign (negative lookahead)
 */
export const blockMathInputRegex = /(^|[^$])\$\$([^$]+)\$\$(?!\$)/

/**
 * This extension allows you to create block math expressions.
 */
export const BlockMath = Node.create<BlockMathOptions>({
  name: 'blockMath',

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  group: 'block',

  content: 'text*',

  marks: '',

  defining: true,

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
        tag: 'div[data-type="block-math"]',
      },
    ]
  },

  renderHTML({ HTMLAttributes, node }) {
    return [
      'div',
      mergeAttributes(
        {
          'data-type': 'block-math',
        },
        this.options.HTMLAttributes,
        HTMLAttributes,
      ),
      node.attrs.src || '',
    ]
  },

  addCommands() {
    return {
      setBlockMathWebKit:
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
      textblockTypeInputRule({
        find: blockMathInputRegex,
        type: this.type,
        getAttributes: match => ({
          src: match[2], // The captured content between double dollar signs
        }),
      }),
    ]
  },
})

export default BlockMath
