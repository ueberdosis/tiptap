import { Node, mergeAttributes } from '@tiptap/core'

export interface TableCellOptions {
  HTMLAttributes: {
    [key: string]: any
  },
}
export const TableCell = Node.create({
  name: 'table_cell',

  defaultOptions: <TableCellOptions>{
    HTMLAttributes: {},
  },

  content: 'block+',

  // attrs: cellAttrs,

  tableRole: 'cell',

  isolating: true,

  parseHTML() {
    // return [{ tag: 'td', getAttrs: dom => getCellAttrs(dom, extraAttrs) }]
    return [{ tag: 'td' }]
  },

  renderHTML({ HTMLAttributes }) {
    // toDOM(node) { return ["td", setCellAttrs(node, extraAttrs), 0] }
    return ['td', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  },

})

declare module '@tiptap/core' {
  interface AllExtensions {
    TableCell: typeof TableCell,
  }
}
