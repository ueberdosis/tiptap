import { NodeType } from 'prosemirror-model'
import getNodeType from '../helpers/getNodeType'
import deleteProps from '../utilities/deleteProps'
import { Command, RawCommands } from '../types'

declare module '@tiptap/core' {
  interface Commands {
    resetNodeAttributes: {
      /**
       * Resets node attributes to the default value.
       */
      resetNodeAttributes: (typeOrName: string | NodeType, attributes: string | string[]) => Command,
    }
  }
}

export const resetNodeAttributes: RawCommands['resetNodeAttributes'] = (typeOrName, attributes) => ({ tr, state, dispatch }) => {
  const type = getNodeType(typeOrName, state.schema)
  const { selection } = tr
  const { ranges } = selection

  ranges.forEach(range => {
    state.doc.nodesBetween(range.$from.pos, range.$to.pos, (node, pos) => {
      if (node.type === type && dispatch) {
        tr.setNodeMarkup(pos, undefined, deleteProps(node.attrs, attributes))
      }
    })
  })

  return true
}
