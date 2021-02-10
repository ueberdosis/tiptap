import { MarkType } from 'prosemirror-model'
import { AnyObject, Command, Commands } from '../types'
import getMarkType from '../helpers/getMarkType'
import getMarkAttributes from '../helpers/getMarkAttributes'

/**
 * Add a mark with new attributes.
 */
export const setMark: Commands['setMark'] = (typeOrName, attributes = {}) => ({ tr, state, dispatch }) => {
  const { selection } = tr
  const { from, to, empty } = selection
  const type = getMarkType(typeOrName, state.schema)
  const oldAttributes = getMarkAttributes(state, type)
  const newAttributes = {
    ...oldAttributes,
    ...attributes,
  }

  if (dispatch) {
    if (empty) {
      tr.addStoredMark(type.create(newAttributes))
    } else {
      tr.addMark(from, to, type.create(newAttributes))
    }
  }

  return true
}

declare module '@tiptap/core' {
  interface Commands {
    setMark: (typeOrName: string | MarkType, attributes?: AnyObject) => Command,
  }
}
