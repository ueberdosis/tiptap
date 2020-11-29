import { EditorState } from 'prosemirror-state'
import { MarkType } from 'prosemirror-model'
import getMarkAttributes from './getMarkAttributes'
import { AnyObject } from '../types'
import isEmptyObject from './isEmptyObject'
import objectIncludes from './objectIncludes'

export default function markHasAttributes(state: EditorState, type: MarkType, attributes: AnyObject) {
  if (isEmptyObject(attributes)) {
    return true
  }

  const originalAttributes = getMarkAttributes(state, type)

  return objectIncludes(originalAttributes, attributes)
}
