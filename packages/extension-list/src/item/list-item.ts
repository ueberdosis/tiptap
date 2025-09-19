import { mergeAttributes, Node } from '@tiptap/core'

export interface ListItemOptions {
  /**
   * The HTML attributes for a list item node.
   * @default {}
   * @example { class: 'foo' }
   */
  HTMLAttributes: Record<string, any>

  /**
   * The node type for bulletList nodes
   * @default 'bulletList'
   * @example 'myCustomBulletList'
   */
  bulletListTypeName: string

  /**
   * The node type for orderedList nodes
   * @default 'orderedList'
   * @example 'myCustomOrderedList'
   */
  orderedListTypeName: string
}

/**
 * This extension allows you to create list items.
 * @see https://www.tiptap.dev/api/nodes/list-item
 */
export const ListItem = Node.create<ListItemOptions>({
  name: 'listItem',

  addOptions() {
    return {
      HTMLAttributes: {},
      bulletListTypeName: 'bulletList',
      orderedListTypeName: 'orderedList',
    }
  },

  content: 'paragraph block*',

  defining: true,

  parseHTML() {
    return [
      {
        tag: 'li',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['li', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  },

  markdown: {
    parseName: 'list_item',

    render: (node, h, ctx) => {
      if (!node || !Array.isArray(node.content)) {
        return ''
      }

      let listCharacter = '-'

      if (ctx.parentType === 'bulletList') {
        listCharacter = '-'
      } else if (ctx.parentType === 'orderedList') {
        listCharacter = `${ctx.index + 1}.`
      } else {
        // Fallback to bullet list for unknown parent types
        listCharacter = '-'
      }

      const [content, ...children] = node.content

      // Render the main list item content (should be a paragraph)
      const mainContent = h.renderChildren([content])
      const output = [`${listCharacter} ${mainContent}`]

      // Handle nested children (like nested lists)
      if (children && children.length > 0) {
        children.forEach(child => {
          const childContent = h.renderChildren([child])
          if (childContent) {
            // Split the child content by lines and indent each line
            const indentedChild = childContent
              .split('\n')
              .map(line => (line ? h.indent(line) : ''))
              .join('\n')
            output.push(indentedChild)
          }
        })
      }

      return output.join('\n')
    },

    parse: (token, helpers) => {
      if (token.type !== 'list_item') {
        return []
      }

      let content: any[] = []

      if (token.tokens && token.tokens.length > 0) {
        // Check if we have paragraph tokens (complex list items)
        const hasParagraphTokens = token.tokens.some(t => t.type === 'paragraph')

        if (hasParagraphTokens) {
          // If we have paragraph tokens, parse them as block elements
          content = helpers.parseChildren(token.tokens)
        } else {
          // Check if the first token is a text token with nested inline tokens
          const firstToken = token.tokens[0]

          if (firstToken && firstToken.type === 'text' && firstToken.tokens && firstToken.tokens.length > 0) {
            // Parse the inline content from the text token
            const inlineContent = helpers.parseInline(firstToken.tokens)

            // Start with the paragraph containing the inline content
            content = [
              {
                type: 'paragraph',
                content: inlineContent,
              },
            ]

            // If there are additional tokens after the first text token (like nested lists),
            // parse them as block elements and add them
            if (token.tokens.length > 1) {
              const remainingTokens = token.tokens.slice(1)
              const additionalContent = helpers.parseChildren(remainingTokens)
              content.push(...additionalContent)
            }
          } else {
            // Fallback: parse all tokens as block elements
            content = helpers.parseChildren(token.tokens)
          }
        }
      }

      // Ensure we always have at least an empty paragraph
      if (content.length === 0) {
        content = [
          {
            type: 'paragraph',
            content: [],
          },
        ]
      }

      return {
        type: 'listItem',
        content,
      }
    },
  },

  addKeyboardShortcuts() {
    return {
      Enter: () => this.editor.commands.splitListItem(this.name),
      Tab: () => this.editor.commands.sinkListItem(this.name),
      'Shift-Tab': () => this.editor.commands.liftListItem(this.name),
    }
  },
})
