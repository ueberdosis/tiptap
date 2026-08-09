import '../types.js'

import { mergeAttributes, Node } from '@tiptap/core'

import { createAlignAttribute } from '../utils/parseAlign.js'
import { parseColwidth } from '../utils/parseColwidth.js'
import { fillEmptyCellContent, isEmptyCellElement } from '../utils/fillEmptyCellContent.js'

export interface TableHeaderOptions {
  /**
   * The HTML attributes for a table header node.
   * @default {}
   * @example { class: 'foo' }
   */
  HTMLAttributes: Record<string, any>
}

/**
 * This extension allows you to create table headers.
 * @see https://www.tiptap.dev/api/nodes/table-header
 */
export const TableHeader = Node.create<TableHeaderOptions>({
  name: 'tableHeader',

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

  tableRole: 'header_cell',

  isolating: true,

  parseHTML() {
    return [
      {
        // Backfill empty cells; non-empty cells fall through to the rule below.
        tag: 'th',
        getAttrs: node => (isEmptyCellElement(node) ? {} : false),
        getContent: (_node, schema) => fillEmptyCellContent(schema.nodes[this.name]),
      },
      { tag: 'th' },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['th', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  },
})
