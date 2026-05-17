import type { JSONContent, MarkdownParseHelpers, MarkdownToken } from '@tiptap/core'
import { mergeAttributes, Node, renderNestedMarkdownContent } from '@tiptap/core'

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

function isSameLineOrderedListToken(token: MarkdownToken): boolean {
  const nestedToken = token.tokens?.[0]

  return Boolean(
    token.text &&
      token.tokens?.length === 1 &&
      nestedToken?.type === 'list' &&
      nestedToken.ordered &&
      nestedToken.raw === token.text,
  )
}

function parseSameLineOrderedListText(text: string, helpers: MarkdownParseHelpers): JSONContent[] {
  if (helpers.tokenizeInline) {
    return helpers.parseInline(helpers.tokenizeInline(text))
  }

  return helpers.parseInline([
    {
      type: 'text',
      raw: text,
      text,
    },
  ])
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

  markdownTokenName: 'list_item',

  parseMarkdown: (token, helpers) => {
    if (token.type !== 'list_item') {
      return []
    }

    const parseBlockChildren = helpers.parseBlockChildren ?? helpers.parseChildren
    let content: any[] = []

    if (token.tokens && token.tokens.length > 0) {
      if (isSameLineOrderedListToken(token)) {
        return {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: parseSameLineOrderedListText(token.text || '', helpers),
            },
          ],
        }
      }

      // Check if we have paragraph tokens (complex list items)
      const hasParagraphTokens = token.tokens.some(t => t.type === 'paragraph')

      if (hasParagraphTokens) {
        // If we have paragraph tokens, parse them as block elements
        content = parseBlockChildren(token.tokens)
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
            const additionalContent = parseBlockChildren(remainingTokens)
            content.push(...additionalContent)
          }
        } else {
          // Fallback: parse all tokens as block elements
          content = parseBlockChildren(token.tokens)
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

  renderMarkdown: (node, h, ctx) => {
    return renderNestedMarkdownContent(
      node,
      h,
      (context: any) => {
        if (context.parentType === 'bulletList') {
          return '- '
        }
        if (context.parentType === 'orderedList') {
          const start = context.meta?.parentAttrs?.start || 1
          return `${start + context.index}. `
        }
        // Fallback to bullet list for unknown parent types
        return '- '
      },
      ctx,
    )
  },

  addKeyboardShortcuts() {
    return {
      Enter: () => this.editor.commands.splitListItem(this.name),
      Tab: () => this.editor.commands.sinkListItem(this.name),
      'Shift-Tab': () => this.editor.commands.liftListItem(this.name),
    }
  },
})
