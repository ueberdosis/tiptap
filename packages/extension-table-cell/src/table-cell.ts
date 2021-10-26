import { Node, mergeAttributes } from '@tiptap/core'

export interface TableCellOptions {
  HTMLAttributes: Record<string, any>,
}

export const TableCell = Node.create<TableCellOptions>({
  name: 'tableCell',

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  content: 'block+',

  addAttributes() {
    return {
      colspan: {
        default: 1,
      },
      rowspan: {
        default: 1,
      },
      colwidth: {
        default: null,
        parseHTML: element => {
          const colwidth = element.getAttribute('colwidth')
          const value = colwidth
            ? [parseInt(colwidth, 10)]
            : null

          return value
        },
      },
    }
  },

  tableRole: 'cell',

  isolating: true,

  parseHTML() {
    return [
      { tag: 'td' },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['td', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  },

})
