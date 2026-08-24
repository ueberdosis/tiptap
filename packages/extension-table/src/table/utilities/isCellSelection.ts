import { CellSelection } from '@tiptap/editor/pm/tables'

export function isCellSelection(value: unknown): value is CellSelection {
  return value instanceof CellSelection
}
