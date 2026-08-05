import { CellSelection } from '@tiptap/pm/tables'

/**
 * Check whether a value is a `CellSelection`.
 */
export function isCellSelection(value: unknown): value is CellSelection {
  return value instanceof CellSelection
}
