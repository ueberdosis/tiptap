import '../types.js'

import { mergeAttributes, Node } from '@tiptap/core'

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
    const parseAlign = (element: HTMLElement) => {
      const styleAlign = (element.style.textAlign || '').trim().toLowerCase()
      const attrAlign = (element.getAttribute('align') || '').trim().toLowerCase()
      const align = styleAlign || attrAlign

      if (align === 'left' || align === 'right' || align === 'center') {
        return align
      }

      return null
    }

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
          const value = colwidth ? colwidth.split(',').map(width => parseInt(width, 10)) : null

          // if there is no colwidth attribute on the cell, try to get it from the colgroup
          if (!value) {
            const cols = element.closest('table')?.querySelectorAll('colgroup > col')
            const cellIndex = Array.from(element.parentElement?.children || []).indexOf(element)

            if (cellIndex && cellIndex > -1 && cols && cols[cellIndex]) {
              const colWidth = cols[cellIndex].getAttribute('width')
              return colWidth ? [parseInt(colWidth, 10)] : null
            }
          }

          return value
        },
      },
      align: {
        default: null,
        parseHTML: element => parseAlign(element as HTMLElement),
        renderHTML: attributes => {
          if (!attributes.align) {
            return {}
          }

          return {
            style: `text-align: ${attributes.align}`,
          }
        },
      },
    }
  },

  tableRole: 'cell',

  isolating: true,

  parseHTML() {
    return [{ tag: 'td' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['td', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  },
})
