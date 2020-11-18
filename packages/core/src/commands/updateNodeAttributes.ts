import { NodeType } from 'prosemirror-model'
import getNodeType from '../utils/getNodeType'
import { Command } from '../types'

export default (typeOrName: string | NodeType, attributes: {}): Command => ({ tr, state, dispatch }) => {
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
