import { mergeAttributes, Node, wrappingInputRule } from '@tiptap/core'

export interface OrderedListOptions {
  itemTypeName: string,
  HTMLAttributes: Record<string, any>,
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    orderedList: {
      /**
       * Toggle an ordered list
       */
      toggleOrderedList: () => ReturnType,
    }
  }
}

export const inputRegex = /^(\d+)\.\s$/

export const OrderedList = Node.create<OrderedListOptions>({
  name: 'orderedList',

  addOptions() {
    return {
      itemTypeName: 'listItem',
      HTMLAttributes: {},
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
      toggleOrderedList: () => ({ commands }) => {
        return commands.toggleList(this.name, this.options.itemTypeName)
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
      wrappingInputRule({
        find: inputRegex,
        type: this.type,
        getAttributes: match => ({ start: +match[1] }),
        joinPredicate: (match, node) => node.childCount + node.attrs.start === +match[1],
      }),
    ]
  },
})
