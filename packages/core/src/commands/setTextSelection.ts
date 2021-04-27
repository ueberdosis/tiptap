import { TextSelection } from 'prosemirror-state'
import { Command, RawCommands, Range } from '../types'

declare module '@tiptap/core' {
  interface Commands {
    setTextSelection: {
      /**
       * Creates a TextSelection.
       */
      setTextSelection: (range: Range) => Command,
    }
  }
}

export const setTextSelection: RawCommands['setTextSelection'] = range => ({ tr, dispatch }) => {
  if (dispatch) {
    const selection = TextSelection.create(tr.doc, range.from, range.to)

    tr.setSelection(selection)
  }

  return true
}
