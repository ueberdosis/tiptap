import '../types.js'

import { mergeAttributes, Node } from '@tiptap/core'

/**
 * Options for the `TableRow` node.
 */
export interface TableRowOptions {
  /**
   * The HTML attributes for a table row node.
   * @default {}
   */
  HTMLAttributes: Record<string, any>
}

/**
 * This extension allows you to create table rows.
 * @see https://tiptap.dev/api/nodes/table-row
 */
export const TableRow = Node.create<TableRowOptions>({
  name: 'tableRow',

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  content: '(tableCell | tableHeader)*',

  tableRole: 'row',

  parseHTML() {
    return [{ tag: 'tr' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['tr', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  },
})
