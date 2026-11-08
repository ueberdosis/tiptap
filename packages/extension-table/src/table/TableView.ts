import type { Node as PMNode } from '@tiptap/pm/model'
import type { EditorView, NodeView, ViewMutationRecord } from '@tiptap/pm/view'

import { applyColumnStyles } from './utilities/applyColumnStyles.js'
import { getColumnStyles } from './utilities/getColumnStyles.js'
import { getColumnWidths } from './utilities/getColumnWidths.js'
import { hasUserWidth } from './utilities/hasUserWidth.js'

/**
 * Brings the `<colgroup>` and the width of a table's DOM in line with the table node.
 *
 * @param node - The table node.
 * @param colgroup - The table's `<colgroup>`.
 * @param table - The `<table>` element.
 * @param cellMinWidth - The minimum width of a cell.
 * @param overrideCol - (Optional) The index of a column whose width is replaced.
 * @param overrideValue - (Optional) The width to use for that column.
 */
export function updateColumns(
  node: PMNode,
  colgroup: HTMLTableColElement, // <colgroup> has the same prototype as <col>
  table: HTMLTableElement,
  cellMinWidth: number,
  overrideCol?: number,
  overrideValue?: number,
) {
  const widths = getColumnWidths(node, overrideCol, overrideValue)
  const styles = getColumnStyles(widths, cellMinWidth, node.attrs.width ?? null)

  applyColumnStyles(colgroup, table, styles, hasUserWidth(node))
}

export class TableView implements NodeView {
  node: PMNode

  cellMinWidth: number

  dom: HTMLDivElement

  table: HTMLTableElement

  colgroup: HTMLTableColElement

  contentDOM: HTMLTableSectionElement

  constructor(
    node: PMNode,
    cellMinWidth: number,
    _view?: EditorView,
    HTMLAttributes: Record<string, any> = {},
  ) {
    this.node = node
    this.cellMinWidth = cellMinWidth
    this.dom = document.createElement('div')
    this.dom.className = 'tableWrapper'
    this.table = this.dom.appendChild(document.createElement('table'))

    // Apply extension-configured HTMLAttributes to the table element
    // (e.g. class, data-* set via Table.configure({ HTMLAttributes }))
    for (const [key, value] of Object.entries(HTMLAttributes)) {
      if (value !== undefined && value !== null) {
        if (key === 'style') {
          this.table.style.cssText = String(value)
        } else {
          this.table.setAttribute(key, String(value))
        }
      }
    }

    // Apply user styles from the ProseMirror document node.
    // This may come from HTML parsing (e.g. <table style="...">) and should
    // override any style set via extension-configured HTMLAttributes above.
    if (node.attrs.style) {
      this.table.style.cssText = node.attrs.style
    }

    this.colgroup = this.table.appendChild(document.createElement('colgroup'))
    updateColumns(node, this.colgroup, this.table, cellMinWidth)
    this.contentDOM = this.table.appendChild(document.createElement('tbody'))
  }

  update(node: PMNode) {
    // Recreate the view to apply changed table attributes.
    if (!node.sameMarkup(this.node)) {
      return false
    }

    this.node = node
    updateColumns(node, this.colgroup, this.table, this.cellMinWidth)

    return true
  }

  ignoreMutation(mutation: ViewMutationRecord) {
    const target = mutation.target as Node
    const isInsideWrapper = this.dom.contains(target)
    const isInsideContent = this.contentDOM.contains(target)

    if (isInsideWrapper && !isInsideContent) {
      if (
        mutation.type === 'attributes' ||
        mutation.type === 'childList' ||
        mutation.type === 'characterData'
      ) {
        return true
      }
    }

    return false
  }
}
