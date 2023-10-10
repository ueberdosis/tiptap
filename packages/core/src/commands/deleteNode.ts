import { NodeType } from '@tiptap/pm/model'

import { getNodeType } from '../helpers/getNodeType.js'
import { RawCommands } from '../types.js'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    deleteNode: {
      /**
       * Delete a node.
       */
      deleteNode: (typeOrName: string | NodeType) => ReturnType,
    }
  }
}

export const deleteNode: RawCommands['deleteNode'] = typeOrName => ({ tr, state, dispatch }) => {
  const type = getNodeType(typeOrName, state.schema)
  const $pos = tr.selection.$anchor

  for (let depth = $pos.depth; depth > 0; depth -= 1) {
    const node = $pos.node(depth)

    if (node.type === type) {
      if (dispatch) {
        const from = $pos.before(depth)
        const to = $pos.after(depth)

        tr.delete(from, to).scrollIntoView()
      }

      return true
    }
  }

  return false
}
