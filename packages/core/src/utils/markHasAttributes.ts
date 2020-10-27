import { EditorState } from 'prosemirror-state'
import { MarkType } from 'prosemirror-model'
import getMarkAttrs from './getMarkAttrs'

export default function markHasAttributes(state: EditorState, type: MarkType, attrs?: { [key: string]: any }): boolean {
  if (attrs === undefined || Object.keys(attrs).length === 0) {
    return true
  }

  const originalAttrs: { [key: string]: any } = getMarkAttrs(state, type)

  return Object.keys(attrs).filter((key: string) => {
    return attrs[key] === originalAttrs[key]
  }).length > 0
}
