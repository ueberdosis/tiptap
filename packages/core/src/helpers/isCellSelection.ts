import { CellSelection } from 'prosemirror-tables'
import isObject from '../utilities/isObject'

export default function isCellSelection(value: unknown): value is CellSelection {
  return isObject(value) && value instanceof CellSelection
}
