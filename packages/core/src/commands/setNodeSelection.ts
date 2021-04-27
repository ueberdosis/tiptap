import { NodeSelection } from 'prosemirror-state'
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
    const selection = NodeSelection.create(tr.doc, position)

    tr.setSelection(selection)
  }

  return true
}
