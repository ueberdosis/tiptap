import { TextSelection } from '@tiptap/pm/state'

/**
 * Check whether a value is a ProseMirror `TextSelection`.
 */
export function isTextSelection(value: unknown): value is TextSelection {
  return value instanceof TextSelection
}
