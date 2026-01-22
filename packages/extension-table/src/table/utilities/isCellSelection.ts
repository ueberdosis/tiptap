import { CellSelection } from '@dibdab/pm/tables'

export function isCellSelection(value: unknown): value is CellSelection {
  return value instanceof CellSelection
}
