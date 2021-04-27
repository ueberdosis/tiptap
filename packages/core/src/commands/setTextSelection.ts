import { TextSelection } from 'prosemirror-state'
import minMax from '../utilities/minMax'
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
    const { doc } = tr
    const from = minMax(range.from, 0, doc.content.size)
    const to = minMax(range.to, 0, doc.content.size)
    const selection = TextSelection.create(doc, from, to)

    tr.setSelection(selection)
  }

  return true
}
