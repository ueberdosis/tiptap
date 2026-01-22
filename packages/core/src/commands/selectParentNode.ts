import { selectParentNode as originalSelectParentNode } from '@dibdab/pm/commands'

import type { CommandSpec } from '../types.js'

declare module '@dibdab/core' {
  interface Commands<ReturnType> {
    selectParentNode: {
      /**
       * Select the parent node.
       * @example editor.commands.selectParentNode()
       */
      selectParentNode: () => ReturnType
    }
  }
}

export const selectParentNode: CommandSpec =
  () =>
  ({ state, dispatch }) => {
    return originalSelectParentNode(state, dispatch)
  }
