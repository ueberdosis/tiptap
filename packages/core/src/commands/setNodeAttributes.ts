import { Command } from '../Editor'

export default (attributes: {}): Command => ({ tr, state, dispatch }) => {
  const { selection } = tr
  const { from, to } = selection

  state.doc.nodesBetween(from, to, (node, pos) => {
    if (!node.type.isText && dispatch) {
      tr.setNodeMarkup(pos, undefined, {
        ...node.attrs,
        ...attributes,
      })
    }
  })

  return true
}
