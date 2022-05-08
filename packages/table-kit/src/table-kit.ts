import { Extension } from '@tiptap/core'

import Table, { TableOptions } from '@tiptap/extension-table'
import TableRow, { TableRowOptions } from '@tiptap/extension-table-row'
import TableCell, { TableCellOptions } from '@tiptap/extension-table-cell'
import TableHeader, { TableHeaderOptions } from '@tiptap/extension-table-header'

export interface TableKitOptions {
  table: Partial<TableOptions> | false
  tableRow: Partial<TableRowOptions> | false
  tableCell: Partial<TableCellOptions> | false
  tableHeader: Partial<TableHeaderOptions> | false
}

export const TableKit = Extension.create({
  name: 'tableKit',

  addExtensions() {
    const extensions = []

    if (this.options.table !== false) {
      extensions.push(Table.configure(this.options?.table))
    }

    if (this.options.tableRow !== false) {
      extensions.push(TableRow.configure(this.options?.tableRow))
    }

    if (this.options.tableCell !== false) {
      extensions.push(TableCell.configure(this.options?.tableCell))
    }

    if (this.options.tableHeader !== false) {
      extensions.push(TableHeader.configure(this.options?.tableHeader))
    }

    return extensions
  },
})
