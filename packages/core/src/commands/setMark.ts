import { MarkType } from 'prosemirror-model'
import { AnyObject, Command, RawCommands } from '../types'
import getMarkType from '../helpers/getMarkType'
import getMarkAttributes from '../helpers/getMarkAttributes'

declare module '@tiptap/core' {
  interface Commands {
    setMark: {
      /**
       * Add a mark with new attributes.
       */
      setMark: (typeOrName: string | MarkType, attributes?: AnyObject) => Command,
    }
  }
}

export const setMark: RawCommands['setMark'] = (typeOrName, attributes = {}) => ({ tr, state, dispatch }) => {
  const { selection } = tr
  const { empty, ranges } = selection
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
      ranges.forEach(range => {
        tr.addMark(range.$from.pos, range.$to.pos, type.create(newAttributes))
      })
    }
  }

  return true
}
