import { Selection, TextSelection } from 'prosemirror-state'
import { minMax } from '../utilities/minMax'
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
    const minPos = Selection.atStart(doc).from
    const maxPos = Selection.atEnd(doc).to
    const resolvedFrom = minMax(from, minPos, maxPos)
    const resolvedEnd = minMax(to, minPos, maxPos)
    const selection = TextSelection.create(doc, resolvedFrom, resolvedEnd)

    tr.setSelection(selection)
  }

  return true
}
