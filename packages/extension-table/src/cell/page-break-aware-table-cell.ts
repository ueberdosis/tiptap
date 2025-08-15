import '../types.js'

import { mergeAttributes, Node } from '@tiptap/core'

export interface PageBreakAwareTableCellOptions {
  /**
   * The HTML attributes for a table cell node.
   * @default {}
   * @example { class: 'foo' }
   */
  HTMLAttributes: Record<string, any>
  /**
   * Enable page break support for table cells
   * @default true
   */
  enablePageBreaks: boolean
  /**
   * Maximum content height before allowing page break (in CSS units)
   * @default 'auto'
   */
  maxCellHeight: string
}

/**
 * Enhanced table cell extension with page break support.
 * This extension allows table cell content to flow across multiple pages
 * similar to Google Docs, preventing tables from breaking when cell content
 * exceeds the page height.
 */
export const PageBreakAwareTableCell = Node.create<PageBreakAwareTableCellOptions>({
  name: 'pageBreakAwareTableCell',

  addOptions() {
    return {
      HTMLAttributes: {},
      enablePageBreaks: true,
      maxCellHeight: 'auto',
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
          const value = colwidth ? colwidth.split(',').map(width => parseInt(width, 10)) : null

          return value
        },
      },
      // Add page break attributes
      pageBreakBefore: {
        default: 'auto',
        parseHTML: element => element.getAttribute('data-page-break-before') || 'auto',
        renderHTML: attributes => {
          if (attributes.pageBreakBefore && attributes.pageBreakBefore !== 'auto') {
            return {
              'data-page-break-before': attributes.pageBreakBefore,
            }
          }
          return {}
        },
      },
      pageBreakAfter: {
        default: 'auto',
        parseHTML: element => element.getAttribute('data-page-break-after') || 'auto',
        renderHTML: attributes => {
          if (attributes.pageBreakAfter && attributes.pageBreakAfter !== 'auto') {
            return {
              'data-page-break-after': attributes.pageBreakAfter,
            }
          }
          return {}
        },
      },
      pageBreakInside: {
        default: 'auto',
        parseHTML: element => element.getAttribute('data-page-break-inside') || 'auto',
        renderHTML: attributes => {
          if (attributes.pageBreakInside && attributes.pageBreakInside !== 'auto') {
            return {
              'data-page-break-inside': attributes.pageBreakInside,
            }
          }
          return {}
        },
      },
    }
  },

  tableRole: 'cell',

  isolating: true,

  parseHTML() {
    return [{ tag: 'td' }]
  },

  renderHTML({ HTMLAttributes, node }) {
    const attrs = mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)

    // Add page break CSS classes if enabled
    if (this.options.enablePageBreaks) {
      const classes = ['page-break-aware-cell']

      if (node.attrs.pageBreakBefore !== 'auto') {
        classes.push(`page-break-before-${node.attrs.pageBreakBefore}`)
      }

      if (node.attrs.pageBreakAfter !== 'auto') {
        classes.push(`page-break-after-${node.attrs.pageBreakAfter}`)
      }

      if (node.attrs.pageBreakInside !== 'auto') {
        classes.push(`page-break-inside-${node.attrs.pageBreakInside}`)
      }

      attrs.class = [attrs.class, ...classes].filter(Boolean).join(' ')

      // Add inline styles for page break behavior
      const styles = []
      if (this.options.maxCellHeight !== 'auto') {
        styles.push(`max-height: ${this.options.maxCellHeight}`)
      }

      if (styles.length > 0) {
        attrs.style = [attrs.style, ...styles].filter(Boolean).join('; ')
      }
    }

    return ['td', attrs, 0]
  },

  addCommands() {
    return {
      /**
       * Set page break behavior for the current table cell
       */
      setCellPageBreak:
        (options: {
          before?: 'auto' | 'always' | 'avoid' | 'left' | 'right'
          after?: 'auto' | 'always' | 'avoid' | 'left' | 'right'
          inside?: 'auto' | 'avoid'
        }) =>
        ({ tr, dispatch, state }: any) => {
          const { selection } = state
          const { $anchor } = selection

          // Find the table cell node
          let cellPos: number | null = null
          for (let depth = $anchor.depth; depth > 0; depth -= 1) {
            if ($anchor.node(depth).type.spec.tableRole === 'cell') {
              cellPos = $anchor.before(depth)
              break
            }
          }

          if (cellPos === null) {
            return false
          }

          if (dispatch) {
            const attrs = { ...$anchor.node().attrs }

            if (options.before) {attrs.pageBreakBefore = options.before}
            if (options.after) {attrs.pageBreakAfter = options.after}
            if (options.inside) {attrs.pageBreakInside = options.inside}

            tr.setNodeMarkup(cellPos, undefined, attrs)
          }

          return true
        },
    } as any
  },

  addGlobalAttributes() {
    return [
      {
        types: [this.name],
        attributes: {
          'data-page-break-before': {
            default: null,
            parseHTML: element => element.getAttribute('data-page-break-before'),
            renderHTML: attributes => {
              if (!attributes['data-page-break-before']) {
                return {}
              }

              return {
                'data-page-break-before': attributes['data-page-break-before'],
              }
            },
          },
          'data-page-break-after': {
            default: null,
            parseHTML: element => element.getAttribute('data-page-break-after'),
            renderHTML: attributes => {
              if (!attributes['data-page-break-after']) {
                return {}
              }

              return {
                'data-page-break-after': attributes['data-page-break-after'],
              }
            },
          },
          'data-page-break-inside': {
            default: null,
            parseHTML: element => element.getAttribute('data-page-break-inside'),
            renderHTML: attributes => {
              if (!attributes['data-page-break-inside']) {
                return {}
              }

              return {
                'data-page-break-inside': attributes['data-page-break-inside'],
              }
            },
          },
        },
      },
    ]
  },
})
