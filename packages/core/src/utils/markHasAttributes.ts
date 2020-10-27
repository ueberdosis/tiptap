import { EditorState } from 'prosemirror-state'
import { MarkType } from 'prosemirror-model'
import getMarkAttrs from './getMarkAttrs'

export default function markHasAttributes(state: EditorState, type: MarkType, attrs?: { [key: string]: any }): boolean {
  // @ts-ignore
  if (attrs === undefined || Object.keys(attrs).length === 0) {
    return true
  }

  const originalAttrs: { [key: string]: any } = getMarkAttrs(state, type)

  // @ts-ignore
  return Object.keys(attrs).filter((key: string) => {
    // @ts-ignore
    // console.log(attrs[key], originalAttrs[key], attrs[key] === originalAttrs[key])
    return attrs[key] === originalAttrs[key]
  }).length
}
