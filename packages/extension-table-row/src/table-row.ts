import { Node, mergeAttributes } from '@tiptap/core'

export interface TableRowOptions {
  HTMLAttributes: {
    [key: string]: any
  },
}

export const TableRow = Node.create({
  name: 'table_row',

  defaultOptions: <TableRowOptions>{
    HTMLAttributes: {},
  },

  content: '(table_cell | table_header)*',

  tableRole: 'row',

  parseHTML() {
    return [{ tag: 'tr' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['tr', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  },
})

declare module '@tiptap/core' {
  interface AllExtensions {
    TableRow: typeof TableRow,
  }
}
