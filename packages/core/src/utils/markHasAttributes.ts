import { EditorState } from 'prosemirror-state'
import { MarkType } from 'prosemirror-model'
import getMarkAttrs from './getMarkAttrs'
import { AnyObject } from '../types'

export default function markHasAttributes(state: EditorState, type: MarkType, attrs: AnyObject) {
  const originalAttrs = getMarkAttrs(state, type)

  return !!Object
    .keys(attrs)
    .filter(key => attrs[key] === originalAttrs[key])
    .length
}
