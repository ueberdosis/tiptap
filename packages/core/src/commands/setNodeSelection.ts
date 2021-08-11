import { Selection, NodeSelection } from 'prosemirror-state'
import minMax from '../utilities/minMax'
import { RawCommands } from '../types'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    setNodeSelection: {
      /**
       * Creates a NodeSelection.
       */
      setNodeSelection: (position: number) => ReturnType,
    }
  }
}

export const setNodeSelection: RawCommands['setNodeSelection'] = position => ({ tr, dispatch }) => {
  if (dispatch) {
    const { doc } = tr
    const minPos = Selection.atStart(doc).from
    const maxPos = Selection.atEnd(doc).to
    const resolvedPos = minMax(position, minPos, maxPos)
    const selection = NodeSelection.create(doc, resolvedPos)

    tr.setSelection(selection)
  }

  return true
}
