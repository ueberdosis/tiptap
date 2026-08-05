import { NodeSelection } from '@tiptap/pm/state'

/**
 * Check whether a value is a ProseMirror `NodeSelection`.
 */
export function isNodeSelection(value: unknown): value is NodeSelection {
  return value instanceof NodeSelection
}
