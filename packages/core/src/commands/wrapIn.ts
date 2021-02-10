import { wrapIn as originalWrapIn } from 'prosemirror-commands'
import { NodeType } from 'prosemirror-model'
import { AnyObject, Command, Commands } from '../types'
import isNodeActive from '../helpers/isNodeActive'
import getNodeType from '../helpers/getNodeType'

declare module '@tiptap/core' {
  interface Commands {
    /**
     * Wraps nodes in another node.
     */
    wrapIn: (typeOrName: string | NodeType, attributes?: AnyObject) => Command,
  }
}

export const wrapIn: Commands['wrapIn'] = (typeOrName, attributes = {}) => ({ state, dispatch }) => {
  const type = getNodeType(typeOrName, state.schema)
  const isActive = isNodeActive(state, type, attributes)

  if (isActive) {
    return false
  }

  return originalWrapIn(type, attributes)(state, dispatch)
}
