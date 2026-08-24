import { NodeSelection } from 'prosemirror-state'

export function isNodeSelection(value: unknown): value is NodeSelection {
  return value instanceof NodeSelection
}
