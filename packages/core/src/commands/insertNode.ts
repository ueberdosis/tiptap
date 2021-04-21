import { NodeType } from 'prosemirror-model'
import getNodeType from '../helpers/getNodeType'
import { Command, RawCommands } from '../types'

declare module '@tiptap/core' {
  interface Commands {
    insertNode: {
      /**
       * Insert a node at the current position.
       */
      insertNode: (typeOrName: string | NodeType, attributes?: Record<string, any>) => Command,
    }
  }
}

export const insertNode: RawCommands['insertNode'] = (typeOrName, attributes = {}) => ({ tr, state, dispatch }) => {
  console.warn('[tiptap warn]: insertNode() is deprecated. please use insertContent() instead.')

  const { selection } = tr
  const type = getNodeType(typeOrName, state.schema)

  if (!type) {
    return false
  }

  const node = type.create(attributes)

  if (dispatch) {
    tr.insert(selection.anchor, node)
  }

  return true
}
