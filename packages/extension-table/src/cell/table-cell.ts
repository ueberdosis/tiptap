import '../types.js'

import { mergeAttributes, Node } from '@tiptap/core'

import { createAlignAttribute } from '../utils/parseAlign.js'
import { parseColwidth } from '../utils/parseColwidth.js'
import { fillEmptyCellContent, isEmptyCellElement } from '../utils/fillEmptyCellContent.js'

export interface TableCellOptions {
  /**
   * The HTML attributes for a table cell node.
   * @default {}
   * @example { class: 'foo' }
   */
  HTMLAttributes: Record<string, any>
}

/**
 * This extension allows you to create table cells.
 * @see https://www.tiptap.dev/api/nodes/table-cell
 */
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
        parseHTML: parseColwidth,
      },
      align: createAlignAttribute(),
    }
  },

  tableRole: 'cell',

  isolating: true,

  parseHTML() {
    return [
      {
        // Backfill empty cells; non-empty cells fall through to the rule below.
        tag: 'td',
        getAttrs: node => (isEmptyCellElement(node) ? {} : false),
        getContent: (_node, schema) => fillEmptyCellContent(schema.nodes[this.name]),
      },
      { tag: 'td' },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['td', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  },
})
