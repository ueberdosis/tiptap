import { joinPoint } from '@tiptap/pm/transform'

import { RawCommands } from '../types.js'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    joinItemBackward: {
      /**
       * Join two nodes Forwards.
       */
      joinItemBackward: () => ReturnType
    }
  }
}

export const joinItemBackward: RawCommands['joinItemBackward'] = () => ({
  tr, state, dispatch,
}) => {
  try {
    const point = joinPoint(state.doc, state.selection.$from.pos, -1)

    if (point === null || point === undefined) {
      return false
    }

    tr.join(point, 2)

    if (dispatch) {
      dispatch(tr)
    }

    return true
  } catch {
    return false
  }
}
