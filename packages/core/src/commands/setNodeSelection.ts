import { NodeSelection } from '@tiptap/pm/state'

import { RawCommands } from '../types.js'
import { minMax } from '../utilities/minMax.js'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    setNodeSelection: {
      /**
       * Creates a NodeSelection.
       */
      setNodeSelection: (position: number) => ReturnType
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
