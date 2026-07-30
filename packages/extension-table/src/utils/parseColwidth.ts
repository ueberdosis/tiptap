/**
 * reads the width of the `<col>` element matching a cell's column from the table's `<colgroup>`
 *
 * @param element - The table cell/header DOM element
 * @returns - An array with the column width in pixels or null
 */
function parseColgroupWidth(element: HTMLElement): number[] | null {
  const row = element.parentElement
  const table = element.closest('table')

  if (!row || !table) {
    return null
  }

  const cellIndex = Array.from(row.children).indexOf(element)
  const width = table.querySelectorAll('colgroup > col')[cellIndex]?.getAttribute('width')

  return width ? [parseInt(width, 10)] : null
}

/**
 * Parse the column width/s of a table cell/header from an HTML element.
 * it prefers the `colwidth` attribute and if not-provided falls back to the `width` attribute
 * of the matching `<col>` element in the table's `<colgroup>`.
 *
 * @param element - The table cell/header DOM element
 * @returns - An array of column widths in pixels or null
 */
export function parseColwidth(element: HTMLElement): number[] | null {
  const colwidth = element.getAttribute('colwidth')

  if (colwidth) {
    return colwidth.split(',').map(width => parseInt(width, 10))
  }

  return parseColgroupWidth(element)
}
