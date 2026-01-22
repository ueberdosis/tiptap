import { NodeSelection } from '@dibdab/pm/state'

export function isNodeSelection(value: unknown): value is NodeSelection {
  return value instanceof NodeSelection
}
