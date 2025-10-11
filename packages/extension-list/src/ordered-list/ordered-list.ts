import { mergeAttributes, Node, wrappingInputRule } from '@tiptap/core'

import { buildNestedStructure, collectOrderedListItems, parseListItems } from './utils.js'

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

  markdownTokenName: 'list',

  parseMarkdown: (token, helpers) => {
    if (token.type !== 'list' || !token.ordered) {
      return []
    }

    const startValue = token.start || 1
    const content = token.items ? parseListItems(token.items, helpers) : []

    if (startValue !== 1) {
      return {
        type: 'orderedList',
        attrs: { start: startValue },
        content,
      }
    }

    return {
      type: 'orderedList',
      content,
    }
  },

  renderMarkdown: (node, h) => {
    if (!node.content) {
      return ''
    }

    return h.renderChildren(node.content, '\n')
  },

  markdownTokenizer: {
    name: 'orderedList',
    level: 'block',
    start: (src: string) => {
      const match = src.match(/^(\s*)(\d+)\.\s+/)
      const index = match?.index
      return index !== undefined ? index : -1
    },
    tokenize: (src: string, _tokens, lexer) => {
      const lines = src.split('\n')
      const [listItems, consumed] = collectOrderedListItems(lines)

      if (listItems.length === 0) {
        return undefined
      }

      const items = buildNestedStructure(listItems, 0, lexer)

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

  markdownOptions: {
    indentsContent: true,
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
