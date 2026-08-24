import { NodeRangeSelection } from './NodeRangeSelection.js'

export function isNodeRangeSelection(value: unknown): value is NodeRangeSelection {
  return value instanceof NodeRangeSelection
}
