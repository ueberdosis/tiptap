import { TextSelection } from 'prosemirror-state'

export function isTextSelection(value: unknown): value is TextSelection {
  return value instanceof TextSelection
}
