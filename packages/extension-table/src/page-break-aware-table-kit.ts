import { Extension } from '@tiptap/core'

import { PageBreakAwareTableCell } from './cell/page-break-aware-table-cell.js'
import { PageBreakAwareTableHeader } from './header/page-break-aware-table-header.js'
import { PageBreakAwareTable } from './table/page-break-aware-table.js'

export interface PageBreakAwareTableKitOptions {
  /**
   * If set to false, the page break aware table extension will not be registered
   * @example table: false
   */
  table:
    | Partial<{
        HTMLAttributes: Record<string, any>
        resizable: boolean
        handleWidth: number
        cellMinWidth: number
        View: any
        lastColumnResizable: boolean
        allowTableNodeSelection: boolean
        enablePageBreaks: boolean
      }>
    | false

  /**
   * If set to false, the page break aware table cell extension will not be registered
   * @example tableCell: false
   */
  tableCell:
    | Partial<{
        HTMLAttributes: Record<string, any>
      }>
    | false

  /**
   * If set to false, the page break aware table header extension will not be registered
   * @example tableHeader: false
   */
  tableHeader:
    | Partial<{
        HTMLAttributes: Record<string, any>
      }>
    | false
}

/**
 * Page Break Aware Table Kit Extension
 *
 * This extension provides a complete table solution with page break support,
 * allowing table cell content to flow across multiple pages similar to Google Docs.
 *
 * Features:
 * - Table cells that can break across pages when content exceeds page height
 * - Maintains table structure integrity across page breaks
 * - Preserves cell borders and styling across pages
 * - Automatic detection of long content for intelligent page breaking
 * - Customizable page break behavior per cell
 * - Full compatibility with existing table functionality
 *
 * @example
 * ```js
 * import { Editor } from '@tiptap/core'
 * import { PageBreakAwareTableKit } from '@tiptap/extension-table'
 *
 * const editor = new Editor({
 *   extensions: [
 *     PageBreakAwareTableKit.configure({
 *       enablePageBreaks: true,
 *       maxCellHeight: '50vh',
 *       table: {
 *         resizable: true,
 *       },
 *     }),
 *   ],
 * })
 * ```
 */
export const PageBreakAwareTableKit = Extension.create<PageBreakAwareTableKitOptions>({
  name: 'pageBreakAwareTableKit',

  addOptions() {
    return {
      table: {},
      tableCell: {},
      tableHeader: {},
    }
  },

  addExtensions() {
    const extensions = []

    if (this.options.table !== false) {
      extensions.push(PageBreakAwareTable.configure(this.options.table || {}))
    }

    if (this.options.tableCell !== false) {
      extensions.push(PageBreakAwareTableCell.configure(this.options.tableCell || {}))
    }

    if (this.options.tableHeader !== false) {
      extensions.push(PageBreakAwareTableHeader.configure(this.options.tableHeader || {}))
    }

    return extensions
  },

  addCommands() {
    return {} as any
  },

  addGlobalAttributes() {
    return [
      {
        types: ['pageBreakAwareTable'],
        attributes: {
          'data-page-break-enabled': {
            default: 'true',
            parseHTML: element => element.getAttribute('data-page-break-enabled') || 'true',
            renderHTML: attributes => {
              return {
                'data-page-break-enabled': attributes['data-page-break-enabled'],
              }
            },
          },
        },
      },
    ]
  },

  onCreate() {
    // Inject CSS for page break support
    if (typeof document !== 'undefined') {
      const existingStyle = document.getElementById('tiptap-page-break-table-styles')
      if (!existingStyle) {
        const style = document.createElement('style')
        style.id = 'tiptap-page-break-table-styles'
        style.textContent = `
          .page-break-aware-cell {
            page-break-inside: auto;
            break-inside: auto;
            vertical-align: top;
            overflow: visible;
            height: auto;
            min-height: 1em;
          }
          
          .page-break-aware-header {
            background-color: var(--gray-1, #f5f5f5);
            font-weight: bold;
            text-align: left;
          }
          
          .page-break-before-always { page-break-before: always; break-before: always; }
          .page-break-before-avoid { page-break-before: avoid; break-before: avoid; }
          .page-break-after-always { page-break-after: always; break-after: always; }
          .page-break-after-avoid { page-break-after: avoid; break-after: avoid; }
          .page-break-inside-avoid { page-break-inside: avoid; break-inside: avoid; }
          
          @media print {
            .page-break-aware-cell {
              page-break-inside: auto;
              break-inside: auto;
              box-decoration-break: clone;
              -webkit-box-decoration-break: clone;
              overflow: visible;
              word-wrap: break-word;
              word-break: break-word;
            }
            
            .page-break-aware-table {
              table-layout: fixed;
              border-collapse: separate;
              border-spacing: 0;
              width: 100%;
            }
            
            .page-break-aware-header {
              background-color: #f5f5f5 !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
          
          .page-break-aware-table-wrapper {
            overflow: visible;
            margin: 1.5rem 0;
          }
          
          .page-break-aware-table-wrapper table {
            border-collapse: separate;
            border-spacing: 0;
            margin: 0;
            table-layout: fixed;
            width: 100%;
          }
          
          .page-break-aware-table-wrapper table td,
          .page-break-aware-table-wrapper table th {
            border: 1px solid var(--gray-3, #d1d5db);
            box-sizing: border-box;
            min-width: 1em;
            padding: 6px 8px;
            position: relative;
            vertical-align: top;
          }
          
          .potentially-long-cell {
            border-left: 3px solid #2196f3;
          }
        `

        document.head.appendChild(style)
      }
    }
  },

  onDestroy() {
    // Clean up injected CSS
    if (typeof document !== 'undefined') {
      const existingStyle = document.getElementById('tiptap-page-break-table-styles')
      if (existingStyle) {
        existingStyle.remove()
      }
    }
  },
})
