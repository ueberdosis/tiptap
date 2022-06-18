import { CellSelection } from 'prosemirror-tables-contently'

export function isCellSelection(value: unknown): value is CellSelection {
  return value instanceof CellSelection
}
