import { Command, Node } from '@tiptap/core'
import { wrappingInputRule } from 'prosemirror-inputrules'

export type OrderedListCommand = () => Command

declare module '@tiptap/core/src/Editor' {
  interface Commands {
    orderedList: OrderedListCommand,
  }
}

export default new Node()
  .name('ordered_list')
  .schema(() => ({
    attrs: {
      order: {
        default: 1,
      },
    },
    content: 'list_item+',
    group: 'block',
    parseDOM: [{
      tag: 'ol',
      getAttrs: node => ({
        order: (node as HTMLElement).hasAttribute('start')
          ? parseInt((node as HTMLElement).getAttribute('start') || '', 10)
          : 1,
      }),
    }],
    toDOM: node => (node.attrs.order === 1
      ? ['ol', 0]
      : ['ol', { start: node.attrs.order }, 0]
    ),
  }))
  .commands(({ name }) => ({
    orderedList: () => ({ commands }) => {
      return commands.toggleList(name, 'list_item')
    },
  }))
  .keys(({ editor }) => ({
    'Shift-Control-9': () => editor.orderedList(),
  }))
  .inputRules(({ type }) => [
    wrappingInputRule(
      /^(\d+)\.\s$/,
      type,
      match => ({ order: +match[1] }),
      (match, node) => node.childCount + node.attrs.order === +match[1],
    ),
  ])
  .create()
