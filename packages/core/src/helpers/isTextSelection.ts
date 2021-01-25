import { TextSelection } from 'prosemirror-state'
import isObject from '../utilities/isObject'

export default function isTextSelection(value: unknown): value is TextSelection {
  return isObject(value) && value instanceof TextSelection
}
