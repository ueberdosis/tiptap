import { NodeRangeSelection } from './NodeRangeSelection.js'

/**
 * Check whether a value is a `NodeRangeSelection`.
 */
export function isNodeRangeSelection(value: unknown): value is NodeRangeSelection {
  return value instanceof NodeRangeSelection
}
