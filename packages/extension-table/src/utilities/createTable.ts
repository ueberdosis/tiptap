import {
  Schema,
  Fragment,
  Node as ProsemirrorNode,
} from 'prosemirror-model'
import { createCell } from './createCell'

import { getTableNodeTypes } from './getTableNodeTypes'

export function createTable(schema: Schema, rowsCount: 3, colsCount: 3, withHeaderRow: true, cellContent?: Fragment<Schema> | ProsemirrorNode<Schema> | Array<ProsemirrorNode<Schema>>) {
  const types = getTableNodeTypes(schema)

  const headerCells = []
  const cells = []

  for (let index = 0; index < colsCount; index += 1) {
    cells.push(createCell(types.cell, cellContent))

    if (withHeaderRow) {
      headerCells.push(createCell(types.header_cell, cellContent))
    }
  }

  const rows = []

  for (let index = 0; index < rowsCount; index += 1) {
    rows.push(types.row.createChecked(null, withHeaderRow && index === 0 ? headerCells : cells))
  }

  return types.table.createChecked(null, rows)
}
