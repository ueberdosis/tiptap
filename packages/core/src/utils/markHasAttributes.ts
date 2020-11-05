import { EditorState } from 'prosemirror-state'
import { MarkType } from 'prosemirror-model'
import getMarkAttrs from './getMarkAttrs'
import { AnyObject } from '../types'
import isEmptyObject from './isEmptyObject'

export default function markHasAttributes(state: EditorState, type: MarkType, attributes: AnyObject) {
  if (isEmptyObject(attributes)) {
    return true
  }

  const originalAttrs = getMarkAttrs(state, type)

  return !!Object
    .keys(attributes)
    .filter(key => attributes[key] === originalAttrs[key])
    .length
}
