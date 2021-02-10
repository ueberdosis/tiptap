import { NodeType } from 'prosemirror-model'
import getNodeType from '../helpers/getNodeType'
import { AnyObject, Command, Commands } from '../types'

declare module '@tiptap/core' {
  interface Commands {
    /**
     * Update attributes of a node.
     */
    updateNodeAttributes: (typeOrName: string | NodeType, attributes: AnyObject) => Command,
  }
}

export const updateNodeAttributes: Commands['updateNodeAttributes'] = (typeOrName, attributes = {}) => ({ tr, state, dispatch }) => {
  const type = getNodeType(typeOrName, state.schema)
  const { selection } = tr
  const { from, to } = selection

  state.doc.nodesBetween(from, to, (node, pos) => {
    if (node.type === type && dispatch) {
      tr.setNodeMarkup(pos, undefined, {
        ...node.attrs,
        ...attributes,
      })
    }
  })

  return true
}
