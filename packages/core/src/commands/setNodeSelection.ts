import { NodeSelection } from 'prosemirror-state'
import minMax from '../utilities/minMax'
import { Command, RawCommands } from '../types'

declare module '@tiptap/core' {
  interface Commands {
    setNodeSelection: {
      /**
       * Creates a NodeSelection.
       */
      setNodeSelection: (position: number) => Command,
    }
  }
}

export const setNodeSelection: RawCommands['setNodeSelection'] = position => ({ tr, dispatch }) => {
  if (dispatch) {
    const { doc } = tr
    const from = minMax(position, 0, doc.content.size)
    const selection = NodeSelection.create(doc, from)

    tr.setSelection(selection)
  }

  return true
}
