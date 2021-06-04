import { TextSelection } from 'prosemirror-state'
import minMax from '../utilities/minMax'
import { RawCommands, Range } from '../types'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    setTextSelection: {
      /**
       * Creates a TextSelection.
       */
      setTextSelection: (position: number | Range) => ReturnType,
    }
  }
}

export const setTextSelection: RawCommands['setTextSelection'] = position => ({ tr, dispatch }) => {
  if (dispatch) {
    const { doc } = tr
    const { from, to } = typeof position === 'number'
      ? { from: position, to: position }
      : position
    const boundedFrom = minMax(from, 0, doc.content.size)
    const boundedTo = minMax(to, 0, doc.content.size)
    const selection = TextSelection.create(doc, boundedFrom, boundedTo)

    tr.setSelection(selection)
  }

  return true
}
