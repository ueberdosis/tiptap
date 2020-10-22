import { Command, createNode } from '@tiptap/core'
import { wrappingInputRule } from 'prosemirror-inputrules'

// export type OrderedListCommand = () => Command

// declare module '@tiptap/core/src/Editor' {
//   interface Commands {
//     orderedList: OrderedListCommand,
//   }
// }

export default createNode({
  name: 'ordered_list',

  content: 'list_item+',

  group: 'block',

  addAttributes() {
    return {
      order: {
        default: 1,
        rendered: false,
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'ol',
        getAttrs: node => ({
          order: (node as HTMLElement).hasAttribute('start')
            ? parseInt((node as HTMLElement).getAttribute('start') || '', 10)
            : 1,
        }),
      },
    ]
  },

  renderHTML({ node, attributes }) {
    return node.attrs.order === 1
      ? ['ol', attributes, 0]
      : ['ol', { ...attributes, start: node.attrs.order }, 0]
  },

  addCommands() {
    return {
      orderedList: () => ({ commands }) => {
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
