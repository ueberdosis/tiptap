/** @jsxImportSource @tiptap/core */
import { mergeAttributes, Node, wrappingInputRule } from '@tiptap/core'

export interface BlockquoteOptions {
  /**
   * HTML attributes to add to the blockquote element
   * @default {}
   * @example { class: 'foo' }
   */
  HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    blockQuote: {
      /**
       * Set a blockquote node
       */
      setBlockquote: () => ReturnType
      /**
       * Toggle a blockquote node
       */
      toggleBlockquote: () => ReturnType
      /**
       * Unset a blockquote node
       */
      unsetBlockquote: () => ReturnType
    }
  }
}

/**
 * Matches a blockquote to a `>` as input.
 */
export const inputRegex = /^\s*>\s$/

/**
 * This extension allows you to create blockquotes.
 * @see https://tiptap.dev/api/nodes/blockquote
 */
export const Blockquote = Node.create<BlockquoteOptions>({
  name: 'blockquote',

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  content: 'block+',

  group: 'block',

  defining: true,

  parseHTML() {
    return [{ tag: 'blockquote' }]
  },

  renderHTML({ HTMLAttributes }) {
    return (
      <blockquote {...mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)}>
        <slot />
      </blockquote>
    )
  },

  parseMarkdown: (token, helpers) => {
    return helpers.createNode('blockquote', undefined, helpers.parseChildren(token.tokens || []))
  },

  renderMarkdown: (node, h) => {
    if (!node.content) {
      return ''
    }

    const lines: string[] = []

    node.content.forEach(child => {
      const lineContent = h.renderChildren(child)
      const withPrefix = lineContent
        .split('\n')
        .map(line => `> ${line}`)
        .join('\n')
      lines.push(withPrefix)
    })

    const linesWithSeparators = lines.flatMap(line => [line, '> '])

    return linesWithSeparators.slice(0, -1).join('\n')
  },

  addCommands() {
    return {
      setBlockquote:
        () =>
        ({ commands }) => {
          return commands.wrapIn(this.name)
        },
      toggleBlockquote:
        () =>
        ({ commands }) => {
          return commands.toggleWrap(this.name)
        },
      unsetBlockquote:
        () =>
        ({ commands }) => {
          return commands.lift(this.name)
        },
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Shift-b': () => this.editor.commands.toggleBlockquote(),
    }
  },

  addInputRules() {
    return [
      wrappingInputRule({
        find: inputRegex,
        type: this.type,
      }),
    ]
  },
})
