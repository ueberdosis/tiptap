import { CellSelection } from '@_bdbch/prosemirror-tables'

export function isCellSelection(value: unknown): value is CellSelection {
  return value instanceof CellSelection
}
