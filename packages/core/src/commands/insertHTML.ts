import { DOMParser } from 'prosemirror-model'
import elementFromString from '../utilities/elementFromString'
import selectionToInsertionEnd from '../helpers/selectionToInsertionEnd'
import { Command, RawCommands } from '../types'

declare module '@tiptap/core' {
  interface Commands {
    insertHTML: {
      /**
       * Insert a string of HTML at the current position.
       */
      insertHTML: (value: string) => Command,
    }
  }
}

export const insertHTML: RawCommands['insertHTML'] = value => ({ tr, state, dispatch }) => {
  console.warn('[tiptap warn]: insertHTML() is deprecated. please use insertContent() instead.')

  const { selection } = tr
  const element = elementFromString(value)
  const slice = DOMParser.fromSchema(state.schema).parseSlice(element)

  if (dispatch) {
    tr.insert(selection.anchor, slice.content)
    selectionToInsertionEnd(tr, tr.steps.length - 1, -1)
  }

  return true
}
