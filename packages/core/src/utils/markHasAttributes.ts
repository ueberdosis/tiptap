import { EditorState } from 'prosemirror-state'
import { MarkType } from 'prosemirror-model'
import getMarkAttrs from './getMarkAttrs'

export default function markHasAttributes(state: EditorState, type: MarkType, attrs?: Object) {
  return attrs === null || JSON.stringify(attrs) === JSON.stringify(
    getMarkAttrs(state, type),
  )
}
