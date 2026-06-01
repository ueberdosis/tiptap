import type { Node as ProseMirrorNode } from '@tiptap/pm/model'
import { Plugin } from '@tiptap/pm/state'

import { mergeAttributes, Node, wrappingInputRule } from '@tiptap/core'

import { buildNestedStructure, collectOrderedListItems, parseListItems } from './utils.js'
import { detectMarkerType } from './roman.js'

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
 * Maps CSS list-style-type values to HTML type attribute values.
 * Google Docs and Word often use CSS instead of the HTML type attribute.
 */
function cssListStyleTypeToHtmlType(style: string): string | null {
  const match = style.match(/list-style-type\s*:\s*([^;]+)/i)
  if (!match) {
    return null
  }

  const cssValue = match[1].trim().toLowerCase()

  switch (cssValue) {
    case 'upper-roman':
      return 'I'
    case 'lower-roman':
      return 'i'
    case 'upper-alpha':
    case 'upper-latin':
      return 'A'
    case 'lower-alpha':
    case 'lower-latin':
      return 'a'
    default:
      return null
  }
}

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
          return element.hasAttribute('start')
            ? parseInt(element.getAttribute('start') || '', 10)
            : 1
        },
      },
      type: {
        default: null,
        parseHTML: element => {
          // 1. Check the HTML type attribute on <ol>
          const htmlType = element.getAttribute('type')
          if (htmlType) {
            return htmlType
          }

          // 2. Check CSS list-style-type on the <ol> element's style attribute
          const style = element.getAttribute('style')
          if (style) {
            const mappedFromOl = cssListStyleTypeToHtmlType(style)
            if (mappedFromOl) {
              return mappedFromOl
            }
          }

          // 3. Check the first <li> child for list-style-type (Google Docs pattern)
          const firstLi = element.querySelector('li')
          if (firstLi) {
            const liStyle = firstLi.getAttribute('style')
            if (liStyle) {
              const mappedFromLi = cssListStyleTypeToHtmlType(liStyle)
              if (mappedFromLi) {
                return mappedFromLi
              }
            }
          }

          return null
        },
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
    const { start, type, ...attributesWithoutType } = HTMLAttributes

    const attrs = mergeAttributes(this.options.HTMLAttributes, attributesWithoutType)

    if (start !== 1) {
      attrs.start = start
    }

    if (type && type !== '1') {
      attrs.type = type
    }

    return ['ol', attrs, 0]
  },

  markdownTokenName: 'list',

  parseMarkdown: (token, helpers) => {
    if (token.type !== 'list' || !token.ordered) {
      return []
    }

    const startValue = token.start || 1
    const typeValue = token.typeMarker as string | undefined
    const content = token.items ? parseListItems(token.items, helpers) : []

    // Build attrs only when they differ from defaults
    const attrs: Record<string, unknown> = {}

    if (startValue !== 1) {
      attrs.start = startValue
    }

    if (typeValue) {
      attrs.type = typeValue
    }

    if (Object.keys(attrs).length > 0) {
      return {
        type: 'orderedList',
        attrs,
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
      const match = src.match(/^(\s*)(\d+|[a-zA-Z]|[ivxlcdmIVXLCDM]{2,15})([.)])\s+/)
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
      const typeMarker = listItems[0]?.type

      return {
        type: 'list',
        ordered: true,
        start: startValue,
        typeMarker,
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

  addProseMirrorPlugins() {
    // Regex matching any typed ordered list marker line
    // Supports: "a.", "A)", "i.", "I)", "1.", "ii)", "IV." etc.
    // Accepts any alphabetical marker — validation is done in detectMarkerType
    const typedListLineRegex = /^([a-zA-Z]|\d+|[ivxlcdmIVXLCDM]{2,8})([.)])\s+(.+)$/

    return [
      new Plugin({
        props: {
          handlePaste: (view, event) => {
            const text = event.clipboardData?.getData('text/plain')
            if (!text) {
              return false
            }

            const lines = text.split('\n').filter(l => l.trim().length > 0)
            if (lines.length === 0) {
              return false
            }

            // Check if ALL lines match a typed ordered list pattern
            const parsedItems: Array<{
              marker: string
              content: string
            }> = []

            for (const line of lines) {
              const match = line.trim().match(typedListLineRegex)
              if (!match) {
                return false
              }
              parsedItems.push({
                marker: match[1],
                content: match[3],
              })
            }

            // All lines match — create an ordered list
            const type = detectMarkerType(parsedItems[0].marker)
            const nodeAttrs = type ? { type } : {}

            const orderedListContent = parsedItems.map(item => ({
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: item.content }],
                },
              ],
            }))

            const orderedListNode = view.state.schema.nodeFromJSON({
              type: 'orderedList',
              attrs: nodeAttrs,
              content: orderedListContent,
            })

            const tr = view.state.tr.replaceSelectionWith(orderedListNode)
            view.dispatch(tr)

            return true
          },
        },
      }),
    ]
  },

  addInputRules() {
    const joinPredicate = (match: RegExpMatchArray, node: ProseMirrorNode) => {
      // Only join if the existing list has a default type
      // (not a typed list like "a" or "i" which should stay separate)
      const hasDefaultType = !node.attrs.type || node.attrs.type === '1'

      return hasDefaultType && node.childCount + node.attrs.start === +match[1]
    }

    let inputRule = wrappingInputRule({
      find: orderedListInputRegex,
      type: this.type,
      getAttributes: match => ({ start: +match[1] }),
      joinPredicate,
    })

    if (this.options.keepMarks || this.options.keepAttributes) {
      inputRule = wrappingInputRule({
        find: orderedListInputRegex,
        type: this.type,
        keepMarks: this.options.keepMarks,
        keepAttributes: this.options.keepAttributes,
        getAttributes: match => ({ start: +match[1], ...this.editor.getAttributes(TextStyleName) }),
        joinPredicate,
        editor: this.editor,
      })
    }
    return [inputRule]
  },
})
