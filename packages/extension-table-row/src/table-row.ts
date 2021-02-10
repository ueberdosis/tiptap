import { Node, mergeAttributes } from '@tiptap/core'

export interface TableRowOptions {
  HTMLAttributes: {
    [key: string]: any
  },
}

export const TableRow = Node.create<TableRowOptions>({
  name: 'tableRow',

  defaultOptions: {
    HTMLAttributes: {},
  },

  content: '(tableCell | tableHeader)*',

  tableRole: 'row',

  parseHTML() {
    return [
      { tag: 'tr' },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['tr', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  },
})
