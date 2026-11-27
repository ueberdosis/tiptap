import type { Node as PMNode } from '@tiptap/pm/model'

/**
 * Reads the stored width of every column from the first row of a table.
 *
 * @param node - The table node.
 * @param overrideCol - (Optional) The index of a column whose width is replaced.
 * @param overrideValue - (Optional) The width to use for that column.
 * @returns One entry per column, `undefined` for a column without a stored width.
 */
export function getColumnWidths(
  node: PMNode,
  overrideCol?: number,
  overrideValue?: number,
): Array<number | undefined> {
  const widths: Array<number | undefined> = []
  const row = node.firstChild

  if (!row) {
    return widths
  }

  for (let i = 0; i < row.childCount; i += 1) {
    const { colspan, colwidth } = row.child(i).attrs

    for (let j = 0; j < colspan; j += 1) {
      const width = overrideCol === widths.length ? overrideValue : colwidth && colwidth[j]

      widths.push(width || undefined)
    }
  }

  return widths
}
