export type RelativeResize = {
  /** The rendered width of each column, in pixels, when the drag started. */
  widths: number[]
  /** The column whose right border is dragged. */
  column: number
  /** How far the border moved, in pixels. */
  delta: number
  /** The narrowest a column may get, in pixels. */
  minWidth: number
  /** The table's width in percent of its container when the drag started. */
  width: number
  /** The rendered width of the table's container, in pixels. */
  containerWidth: number
}

/**
 * Computes the column widths and the table width after dragging a column border in a table
 * with a relative width.
 *
 * An inner border moves width between the column and its right neighbour, so the table
 * keeps its width. The last column's border changes the table's width instead.
 *
 * @returns The new pixel width of each column and the table's new width in percent.
 */
export function resizeRelativeColumns({
  widths,
  column,
  delta,
  minWidth,
  width,
  containerWidth,
}: RelativeResize): { widths: number[]; width: number } {
  const next = widths.slice()

  if (column === widths.length - 1) {
    next[column] = Math.max(minWidth, widths[column] + delta)

    const grown = ((next[column] - widths[column]) / containerWidth) * 100

    return { widths: next, width: roundPercent(width + grown) }
  }

  const pair = widths[column] + widths[column + 1]

  next[column] = Math.min(Math.max(widths[column] + delta, minWidth), pair - minWidth)
  next[column + 1] = pair - next[column]

  return { widths: next, width }
}

// A tenth of a percent is finer than a pixel in any container narrower than 1000px.
function roundPercent(percent: number): number {
  return Math.round(percent * 10) / 10
}
