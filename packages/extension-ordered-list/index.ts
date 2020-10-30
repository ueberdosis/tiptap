import { Command, createNode } from '@tiptap/core'
import { wrappingInputRule } from 'prosemirror-inputrules'

const OrderedList = createNode({
  name: 'ordered_list',

  group: 'block',

  content: 'list_item+',

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

  renderHTML({ attributes }) {
    const { start, ...attributesWithoutStart } = attributes

    return start === 1
      ? ['ol', attributesWithoutStart, 0]
      : ['ol', attributes, 0]
  },

  addCommands() {
    return {
      orderedList: (): Command => ({ commands }) => {
        return commands.toggleList('ordered_list', 'list_item')
      },
    }
  },

  addKeyboardShortcuts() {
    return {
      'Shift-Control-9': () => this.editor.orderedList(),
    }
  },

  addInputRules() {
    return [
      wrappingInputRule(
        /^(\d+)\.\s$/,
        this.type,
        match => ({ order: +match[1] }),
        (match, node) => node.childCount + node.attrs.order === +match[1],
      ),
    ]
  },
})

export default OrderedList

declare module '@tiptap/core/src/Editor' {
  interface AllExtensions {
    OrderedList: typeof OrderedList,
  }
}
