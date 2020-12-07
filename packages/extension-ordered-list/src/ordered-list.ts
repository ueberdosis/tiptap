import { Command, Node, mergeAttributes } from '@tiptap/core'
import { wrappingInputRule } from 'prosemirror-inputrules'

export interface OrderedListOptions {
  HTMLAttributes: {
    [key: string]: any
  },
}

export const inputRegex = /^(\d+)\.\s$/

export const OrderedList = Node.create({
  name: 'orderedList',

  defaultOptions: <OrderedListOptions>{
    HTMLAttributes: {},
  },

  group: 'block list',

  content: 'listItem+',

  addAttributes() {
    return {
      start: {
        default: 1,
        parseHTML: element => ({
          start: element.hasAttribute('start')
            ? parseInt(element.getAttribute('start') || '', 10)
            : 1,
        }),
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

  addCommands() {
    return {
      /**
       * Toggle an ordered list
       */
      toggleOrderedList: (): Command => ({ commands }) => {
        return commands.toggleList('orderedList', 'listItem')
      },
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Shift-7': () => this.editor.commands.toggleOrderedList(),
    }
  },

  addInputRules() {
    return [
      wrappingInputRule(
        inputRegex,
        this.type,
        match => ({ order: +match[1] }),
        (match, node) => node.childCount + node.attrs.order === +match[1],
      ),
    ]
  },
})

declare module '@tiptap/core' {
  interface AllExtensions {
    OrderedList: typeof OrderedList,
  }
}
