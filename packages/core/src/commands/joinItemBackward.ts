import { joinPoint } from '@dibdab/pm/transform'

import type { CommandSpec } from '../types.js'

declare module '@dibdab/core' {
  interface Commands<ReturnType> {
    joinItemBackward: {
      /**
       * Join two items backward.
       * @example editor.commands.joinItemBackward()
       */
      joinItemBackward: () => ReturnType
    }
  }
}

export const joinItemBackward: CommandSpec =
  () =>
  ({ state, dispatch, tr }) => {
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
