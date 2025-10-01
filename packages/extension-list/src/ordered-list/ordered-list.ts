import { mergeAttributes, Node, wrappingInputRule } from '@tiptap/core'

const ListItemName = 'listItem'
const TextStyleName = 'textStyle'

export interface OrderedListOptions {
  /**
   * The node type name for list items.
   * @default 'listItem'
   * @example 'myListItem'
   */
  itemTypeName: string

  /**
   * The HTML attributes for an ordered list node.
   * @default {}
   * @example { class: 'foo' }
   */
  HTMLAttributes: Record<string, any>

  /**
   * Keep the marks when splitting a list item.
   * @default false
   * @example true
   */
  keepMarks: boolean

  /**
   * Keep the attributes when splitting a list item.
   * @default false
   * @example true
   */
  keepAttributes: boolean
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    orderedList: {
      /**
       * Toggle an ordered list
       * @example editor.commands.toggleOrderedList()
       */
      toggleOrderedList: () => ReturnType
    }
  }
}

/**
 * Matches an ordered list to a 1. on input (or any number followed by a dot).
 */
export const orderedListInputRegex = /^(\d+)\.\s$/

/**
 * This extension allows you to create ordered lists.
 * This requires the ListItem extension
 * @see https://www.tiptap.dev/api/nodes/ordered-list
 * @see https://www.tiptap.dev/api/nodes/list-item
 */
export const OrderedList = Node.create<OrderedListOptions>({
  name: 'orderedList',

  addOptions() {
    return {
      itemTypeName: 'listItem',
      HTMLAttributes: {},
      keepMarks: false,
      keepAttributes: false,
    }
  },

  group: 'block list',

  content() {
    return `${this.options.itemTypeName}+`
  },

  addAttributes() {
    return {
      start: {
        default: 1,
        parseHTML: element => {
          return element.hasAttribute('start') ? parseInt(element.getAttribute('start') || '', 10) : 1
        },
      },
      type: {
        default: null,
        parseHTML: element => element.getAttribute('type'),
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'ol',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    const { start, ...attributesWithoutStart } = HTMLAttributes

    return start === 1
      ? ['ol', mergeAttributes(this.options.HTMLAttributes, attributesWithoutStart), 0]
      : ['ol', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  },

  markdown: {
    parseName: 'list',
    isIndenting: true,

    render: (node, h) => {
      if (!node.content) {
        return ''
      }

      return h.renderChildren(node.content, '\n')
    },

    tokenizer: {
      name: 'orderedList',
      level: 'block',
      start: (src: string) => {
        const match = src.match(/^(\s*)(\d+)\.\s+/)
        return match ? match.index : undefined
      },
      tokenize: (src: string, _tokens, lexer) => {
        const lines = src.split('\n')
        const listItems: Array<{
          indent: number
          number: number
          content: string
          raw: string
        }> = []

        let i = 0
        let consumed = 0

        // Parse all ordered list items from the beginning
        while (i < lines.length) {
          const line = lines[i]
          const match = line.match(/^(\s*)(\d+)\.\s+(.*)$/)

          if (!match) {
            break
          }

          const [, indent, number, content] = match
          const indentLevel = indent.length
          let itemContent = content
          let j = i + 1
          const itemLines = [line]

          // Collect continuation lines for this item
          while (j < lines.length) {
            const nextLine = lines[j]
            const nextMatch = nextLine.match(/^(\s*)(\d+)\.\s+(.*)$/)

            if (nextMatch) {
              const nextIndentLevel = nextMatch[1].length
              // If next item is at same or lesser indent, this item is done
              if (nextIndentLevel <= indentLevel) {
                break
              }
            }

            // Check for continuation content
            if (nextLine.trim() === '') {
              // Empty line
              itemLines.push(nextLine)
              itemContent += '\n'
              j += 1
            } else if (nextLine.match(/^\s/)) {
              // Indented content - part of this item
              itemLines.push(nextLine)
              itemContent += `\n${nextLine.slice(indentLevel + 2)}` // Remove list marker indent
              j += 1
            } else {
              // Non-indented line means end of list
              break
            }
          }

          listItems.push({
            indent: indentLevel,
            number: parseInt(number, 10),
            content: itemContent.trim(),
            raw: itemLines.join('\n'),
          })

          consumed = j
          i = j
        }

        if (listItems.length === 0) {
          return undefined
        }

        // Build proper nested structure recursively
        const buildNestedStructure = (items: typeof listItems, baseIndent: number) => {
          const result: unknown[] = []
          let idx = 0

          while (idx < items.length) {
            const item = items[idx]

            if (item.indent === baseIndent) {
              // This item belongs at the current level
              const contentLines = item.content.split('\n')
              const mainText = contentLines[0]?.trim() || ''

              const tokens = []

              // Always wrap the main text in a paragraph token
              if (mainText) {
                tokens.push({
                  type: 'paragraph',
                  raw: mainText,
                  tokens: lexer.inlineTokens(mainText),
                })
              }

              // Handle additional content after the main text
              const additionalContent = contentLines.slice(1).join('\n').trim()
              if (additionalContent) {
                // Parse as block tokens (handles mixed unordered lists, etc.)
                const blockTokens = lexer.blockTokens(additionalContent)
                tokens.push(...blockTokens)
              }

              // Look ahead to find nested items at deeper indent levels
              let j = idx + 1
              const nestedItems = []

              while (j < items.length && items[j].indent > baseIndent) {
                nestedItems.push(items[j])
                j += 1
              }

              // If we have nested items, recursively build their structure
              if (nestedItems.length > 0) {
                // Group nested items by their immediate child indent level
                const nextIndent = Math.min(...nestedItems.map(ni => ni.indent))
                const immediateChildren = nestedItems.filter(ni => ni.indent === nextIndent)

                if (immediateChildren.length > 0) {
                  // Build the nested list
                  const nestedListItems = buildNestedStructure(nestedItems, nextIndent)

                  // Create a nested list token
                  tokens.push({
                    type: 'list',
                    ordered: true,
                    start: immediateChildren[0].number,
                    items: nestedListItems,
                    raw: nestedItems.map(ni => ni.raw).join('\n'),
                  })
                }
              }

              result.push({
                type: 'list_item',
                raw: item.raw,
                tokens,
              })

              // Skip the nested items we just processed
              idx = j
            } else {
              // This item has deeper indent than we're currently processing
              // It should be handled by a recursive call
              idx += 1
            }
          }

          return result
        }

        const items = buildNestedStructure(listItems, 0)

        if (items.length === 0) {
          return undefined
        }

        const startValue = listItems[0]?.number || 1

        return {
          type: 'list',
          ordered: true,
          start: startValue,
          items,
          raw: lines.slice(0, consumed).join('\n'),
        } as unknown as object
      },
    },

    parse: (token, helpers) => {
      if (token.type !== 'list' || !token.ordered) {
        return []
      }

      const startValue = token.start || 1

      if (startValue !== 1) {
        return {
          type: 'orderedList',
          attrs: { start: startValue },
          content: token.items ? helpers.parseChildren(token.items) : [],
        }
      }

      return {
        type: 'orderedList',
        content: token.items ? helpers.parseChildren(token.items) : [],
      }
    },
  },

  addCommands() {
    return {
      toggleOrderedList:
        () =>
        ({ commands, chain }) => {
          if (this.options.keepAttributes) {
            return chain()
              .toggleList(this.name, this.options.itemTypeName, this.options.keepMarks)
              .updateAttributes(ListItemName, this.editor.getAttributes(TextStyleName))
              .run()
          }
          return commands.toggleList(this.name, this.options.itemTypeName, this.options.keepMarks)
        },
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Shift-7': () => this.editor.commands.toggleOrderedList(),
    }
  },

  addInputRules() {
    let inputRule = wrappingInputRule({
      find: orderedListInputRegex,
      type: this.type,
      getAttributes: match => ({ start: +match[1] }),
      joinPredicate: (match, node) => node.childCount + node.attrs.start === +match[1],
    })

    if (this.options.keepMarks || this.options.keepAttributes) {
      inputRule = wrappingInputRule({
        find: orderedListInputRegex,
        type: this.type,
        keepMarks: this.options.keepMarks,
        keepAttributes: this.options.keepAttributes,
        getAttributes: match => ({ start: +match[1], ...this.editor.getAttributes(TextStyleName) }),
        joinPredicate: (match, node) => node.childCount + node.attrs.start === +match[1],
        editor: this.editor,
      })
    }
    return [inputRule]
  },
})
