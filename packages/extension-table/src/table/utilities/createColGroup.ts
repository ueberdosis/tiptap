import type { DOMOutputSpec, Node as PMNode } from '@tiptap/pm/model'

import { getColumnStyles } from './getColumnStyles.js'
import { getColumnWidths } from './getColumnWidths.js'

export type ColGroup =
  | {
      colgroup: DOMOutputSpec
      tableWidth: string
      tableMinWidth: string
    }
  | Record<string, never>

/**
 * Creates a colgroup element for a table node in ProseMirror.
 *
 * @param node - The ProseMirror node representing the table.
 * @param cellMinWidth - The minimum width of a cell in the table.
 * @param overrideCol - (Optional) The index of the column to override the width of.
 * @param overrideValue - (Optional) The width value to use for the overridden column.
 * @returns An object containing the colgroup element, the total width of the table, and the minimum width of the table.
 */
export function createColGroup(node: PMNode, cellMinWidth: number): ColGroup
export function createColGroup(
  node: PMNode,
  cellMinWidth: number,
  overrideCol: number,
  overrideValue: number,
): ColGroup
export function createColGroup(
  node: PMNode,
  cellMinWidth: number,
  overrideCol?: number,
  overrideValue?: number,
): ColGroup {
  if (!node.firstChild) {
    return {}
  }

  const widths = getColumnWidths(node, overrideCol, overrideValue)
  const { cols, tableWidth, tableMinWidth } = getColumnStyles(
    widths,
    cellMinWidth,
    node.attrs.width ?? null,
  )

  const colgroup: DOMOutputSpec = [
    'colgroup',
    {},
    ...cols.map(([property, value]): DOMOutputSpec => ['col', { style: `${property}: ${value}` }]),
  ]

  return { colgroup, tableWidth, tableMinWidth }
}
