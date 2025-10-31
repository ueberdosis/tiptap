import type { Node as ProseMirrorNode } from '@tiptap/pm/model'
import type { NodeView, ViewMutationRecord } from '@tiptap/pm/view'

import { updateColumns } from './TableView.js'

/**
 * Enhanced TableView that supports page breaks for table cells
 * This extends the standard TableView to handle cells that exceed page height
 */
export class PageBreakAwareTableView implements NodeView {
  node: ProseMirrorNode
  cellMinWidth: number
  dom: HTMLDivElement
  table: HTMLTableElement
  colgroup: HTMLTableColElement
  contentDOM: HTMLTableSectionElement
  enablePageBreaks: boolean

  constructor(node: ProseMirrorNode, cellMinWidth: number, enablePageBreaks = true) {
    this.node = node
    this.cellMinWidth = cellMinWidth
    this.enablePageBreaks = enablePageBreaks

    // Create the wrapper div
    this.dom = document.createElement('div')
    this.dom.className = enablePageBreaks ? 'tableWrapper page-break-aware-table-wrapper' : 'tableWrapper'

    // Create the table element
    this.table = this.dom.appendChild(document.createElement('table'))

    // Add page break aware class if enabled
    if (enablePageBreaks) {
      this.table.classList.add('page-break-aware-table')
    }

    // Create colgroup and tbody
    this.colgroup = this.table.appendChild(document.createElement('colgroup'))
    updateColumns(node, this.colgroup, this.table, cellMinWidth)
    this.contentDOM = this.table.appendChild(document.createElement('tbody'))

    // Initialize page break support
    if (enablePageBreaks) {
      this.initializePageBreakSupport()
    }
  }

  private initializePageBreakSupport() {
    // Add resize observer to handle dynamic content changes
    if (typeof ResizeObserver !== 'undefined') {
      const resizeObserver = new ResizeObserver(() => {
        this.handleContentResize()
      })
      resizeObserver.observe(this.table)
    }

    // Add mutation observer to watch for cell content changes
    if (typeof MutationObserver !== 'undefined') {
      const mutationObserver = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
          if (mutation.type === 'childList' || mutation.type === 'characterData') {
            this.handleContentChange()
          }
        })
      })

      mutationObserver.observe(this.contentDOM, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true,
        attributeFilter: ['data-page-break-before', 'data-page-break-after', 'data-page-break-inside'],
      })
    }
  }

  private handleContentResize() {
    // Check if any cells exceed reasonable height and might need page breaks
    const cells = this.table.querySelectorAll('td, th')

    cells.forEach((cell: Element) => {
      const htmlCell = cell as HTMLTableCellElement
      const cellHeight = htmlCell.offsetHeight
      const viewportHeight = window.innerHeight

      // If cell is taller than 80% of viewport, mark it for potential page breaking
      if (cellHeight > viewportHeight * 0.8) {
        htmlCell.classList.add('potentially-long-cell')

        // Add data attribute to indicate content might flow across pages
        if (!htmlCell.hasAttribute('data-page-break-inside')) {
          htmlCell.setAttribute('data-page-break-inside', 'auto')
        }
      } else {
        htmlCell.classList.remove('potentially-long-cell')
      }
    })
  }

  private handleContentChange() {
    // Re-evaluate page break needs when content changes
    this.handleContentResize()

    // Update page break attributes for cells based on content
    const cells = this.table.querySelectorAll('td, th')

    cells.forEach((cell: Element) => {
      const htmlCell = cell as HTMLTableCellElement

      // Check if cell contains elements that shouldn't be broken
      const hasUnbreakableContent = htmlCell.querySelector('img, svg, canvas, iframe')

      if (hasUnbreakableContent && !htmlCell.hasAttribute('data-page-break-inside')) {
        htmlCell.setAttribute('data-page-break-inside', 'avoid')
      }

      // Handle nested tables - they should avoid breaking
      const hasNestedTable = htmlCell.querySelector('table')
      if (hasNestedTable && !htmlCell.hasAttribute('data-page-break-inside')) {
        htmlCell.setAttribute('data-page-break-inside', 'avoid')
      }
    })
  }

  update(node: ProseMirrorNode) {
    if (node.type !== this.node.type) {
      return false
    }

    this.node = node
    updateColumns(node, this.colgroup, this.table, this.cellMinWidth)

    // Update page break support if enabled
    if (this.enablePageBreaks) {
      // Re-evaluate page break needs after update
      setTimeout(() => this.handleContentChange(), 0)
    }

    return true
  }

  ignoreMutation(mutation: ViewMutationRecord) {
    // Ignore mutations on table structure elements
    if (
      mutation.type === 'attributes' &&
      (mutation.target === this.table || this.colgroup.contains(mutation.target as Node))
    ) {
      return true
    }

    // Ignore page break related attribute changes as they're handled by our observers
    if (
      mutation.type === 'attributes' &&
      mutation.attributeName &&
      mutation.attributeName.startsWith('data-page-break-')
    ) {
      return true
    }

    return false
  }

  destroy() {
    // Clean up observers if they exist
    // ResizeObserver and MutationObserver will be automatically cleaned up
    // when the DOM element is removed, but we can manually disconnect them
    // if we stored references to them
  }

  /**
   * Set page break behavior for a specific cell
   */
  setCellPageBreak(
    cellElement: HTMLTableCellElement,
    options: {
      before?: string
      after?: string
      inside?: string
    },
  ) {
    if (options.before) {
      cellElement.setAttribute('data-page-break-before', options.before)
      cellElement.classList.toggle(`page-break-before-${options.before}`, options.before !== 'auto')
    }

    if (options.after) {
      cellElement.setAttribute('data-page-break-after', options.after)
      cellElement.classList.toggle(`page-break-after-${options.after}`, options.after !== 'auto')
    }

    if (options.inside) {
      cellElement.setAttribute('data-page-break-inside', options.inside)
      cellElement.classList.toggle(`page-break-inside-${options.inside}`, options.inside !== 'auto')
    }
  }

  /**
   * Get page break information for all cells
   */
  getPageBreakInfo() {
    const cells = this.table.querySelectorAll('td, th')
    const cellInfo: Array<{
      element: HTMLTableCellElement
      pageBreakBefore: string
      pageBreakAfter: string
      pageBreakInside: string
      height: number
      isLong: boolean
    }> = []

    cells.forEach((cell: Element) => {
      const htmlCell = cell as HTMLTableCellElement
      cellInfo.push({
        element: htmlCell,
        pageBreakBefore: htmlCell.getAttribute('data-page-break-before') || 'auto',
        pageBreakAfter: htmlCell.getAttribute('data-page-break-after') || 'auto',
        pageBreakInside: htmlCell.getAttribute('data-page-break-inside') || 'auto',
        height: htmlCell.offsetHeight,
        isLong: htmlCell.classList.contains('potentially-long-cell'),
      })
    })

    return cellInfo
  }
}
