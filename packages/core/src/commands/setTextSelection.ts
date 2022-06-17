import { TextSelection } from 'prosemirror-state'

import { Range, RawCommands } from '../types'
import { minMax } from '../utilities/minMax'

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
    const minPos = TextSelection.atStart(doc).from
    const maxPos = TextSelection.atEnd(doc).to
    const resolvedFrom = minMax(from, minPos, maxPos)
    const resolvedEnd = minMax(to, minPos, maxPos)
    const selection = TextSelection.create(doc, resolvedFrom, resolvedEnd)

    tr.setSelection(selection)
  }

  return true
}
