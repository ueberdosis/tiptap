import { NodeType } from 'prosemirror-model'
import getNodeType from '../helpers/getNodeType'
import deleteProps from '../utilities/deleteProps'
import { Command, Commands } from '../types'

/**
 * Resets node attributes to the default value.
 */
export const resetNodeAttributes: Commands['resetNodeAttributes'] = (typeOrName, attributes) => ({ tr, state, dispatch }) => {
  const type = getNodeType(typeOrName, state.schema)
  const { selection } = tr
  const { from, to } = selection

  state.doc.nodesBetween(from, to, (node, pos) => {
    if (node.type === type && dispatch) {
      tr.setNodeMarkup(pos, undefined, deleteProps(node.attrs, attributes))
    }
  })

  return true
}

declare module '@tiptap/core' {
  interface Commands {
    resetNodeAttributes: (typeOrName: string | NodeType, attributes: string | string[]) => Command,
  }
}
