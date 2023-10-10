import { RawCommands } from '../types.js'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    deleteCurrentNode: {
      /**
       * Delete the node that currently has the selection anchor.
       */
      deleteCurrentNode: () => ReturnType,
    }
  }
}

export const deleteCurrentNode: RawCommands['deleteCurrentNode'] = () => ({ tr, dispatch }) => {
  const { selection } = tr
  const currentNode = selection.$anchor.node()

  // if there is content inside the current node, break out of this command
  if (currentNode.content.size > 0) {
    return false
  }

  const $pos = tr.selection.$anchor

  for (let depth = $pos.depth; depth > 0; depth -= 1) {
    const node = $pos.node(depth)

    if (node.type === currentNode.type) {
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
