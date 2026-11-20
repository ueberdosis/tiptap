import type { ColumnStyles } from './getColumnStyles.js'

/**
 * Writes column and table styles to the DOM of a table, adding or removing `<col>` elements
 * so there is one per column.
 *
 * @param colgroup - The table's `<colgroup>`.
 * @param table - The `<table>` element.
 * @param styles - The styles from `getColumnStyles`.
 * @param userWidth - Whether a `style` attribute on the node already sets the table's width.
 */
export function applyColumnStyles(
  colgroup: HTMLTableColElement, // <colgroup> has the same prototype as <col>
  table: HTMLTableElement,
  styles: ColumnStyles,
  userWidth: boolean,
) {
  let nextDOM = colgroup.firstChild

  styles.cols.forEach(([property, value]) => {
    const cssText = `${property}: ${value};`

    if (!nextDOM) {
      const colElement = document.createElement('col')

      colElement.style.cssText = cssText
      colgroup.appendChild(colElement)

      return
    }

    const colElement = nextDOM as HTMLTableColElement

    // Replace the whole declaration, so a column switching between `width` and
    // `min-width` does not keep the other one.
    if (colElement.style.cssText !== cssText) {
      colElement.style.cssText = cssText
    }

    nextDOM = colElement.nextSibling
  })

  while (nextDOM) {
    const after = nextDOM.nextSibling

    nextDOM.parentNode?.removeChild(nextDOM)
    nextDOM = after
  }

  if (userWidth) {
    // The user's width wins, so the computed width only serves as a minimum.
    table.style.width = ''
    table.style.minWidth = styles.tableMinWidth || styles.tableWidth

    return
  }

  table.style.width = styles.tableWidth
  table.style.minWidth = styles.tableMinWidth
}
