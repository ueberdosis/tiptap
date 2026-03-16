import '../types.js'

import { mergeAttributes, Node } from '@tiptap/core'

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

  tableRole: 'header_cell',

  isolating: true,

  parseHTML() {
    return [{ tag: 'th' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['th', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  },
})
