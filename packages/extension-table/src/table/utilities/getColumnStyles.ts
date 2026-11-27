import { getColStyleDeclaration } from './colStyle.js'

export type ColumnStyles = {
  /** One CSS declaration per `<col>`, in column order. */
  cols: Array<[string, string]>
  /** The table's `width`, or an empty string to leave it unset. */
  tableWidth: string
  /** The table's `min-width`, or an empty string to leave it unset. */
  tableMinWidth: string
}

/**
 * Computes the styles of a table and its columns.
 *
 * Without a relative width, a column with a stored width gets it in pixels, and the table
 * is as wide as the sum when every column has one. With a relative width, the table takes
 * that share of its container and the stored widths act as proportions, so each column
 * gets its share of their sum. A column without a stored width counts as `cellMinWidth`.
 *
 * @param widths - The stored width of each column, `undefined` where there is none.
 * @param cellMinWidth - The minimum width of a cell.
 * @param relativeWidth - The table's width in percent of its container, or `null`.
 */
export function getColumnStyles(
  widths: Array<number | undefined>,
  cellMinWidth: number,
  relativeWidth: number | null,
): ColumnStyles {
  if (relativeWidth) {
    const shares = widths.map(width => width || cellMinWidth)
    const sum = shares.reduce((total, share) => total + share, 0)

    return {
      cols: shares.map(share => ['width', `${toPercent(share / sum)}%`]),
      tableWidth: `${relativeWidth}%`,
      // In a container too narrow for the minimum cells, the table overflows it, as today.
      tableMinWidth: `${widths.length * cellMinWidth}px`,
    }
  }

  let totalWidth = 0
  let fixedWidth = true

  const cols = widths.map(width => {
    totalWidth += width || cellMinWidth

    if (!width) {
      fixedWidth = false
    }

    return getColStyleDeclaration(cellMinWidth, width)
  })

  return {
    cols,
    tableWidth: fixedWidth ? `${totalWidth}px` : '',
    tableMinWidth: fixedWidth ? '' : `${totalWidth}px`,
  }
}

// Four decimals keep the rendered HTML readable and are far below a pixel.
function toPercent(fraction: number): number {
  return Math.round(fraction * 1_000_000) / 10_000
}
