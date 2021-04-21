import { NodeType } from 'prosemirror-model'
import getNodeType from '../helpers/getNodeType'
import { Command, RawCommands } from '../types'

declare module '@tiptap/core' {
  interface Commands {
    updateNodeAttributes: {
      /**
       * Update attributes of a node.
       */
      updateNodeAttributes: (typeOrName: string | NodeType, attributes: Record<string, any>) => Command,
    }
  }
}

export const updateNodeAttributes: RawCommands['updateNodeAttributes'] = (typeOrName, attributes = {}) => ({ tr, state, dispatch }) => {
  console.warn('[tiptap warn]: updateNodeAttributes() is deprecated. please use updateAttributes() instead.')

  const type = getNodeType(typeOrName, state.schema)
  const { selection } = tr
  const { ranges } = selection

  ranges.forEach(range => {
    state.doc.nodesBetween(range.$from.pos, range.$to.pos, (node, pos) => {
      if (node.type === type && dispatch) {
        tr.setNodeMarkup(pos, undefined, {
          ...node.attrs,
          ...attributes,
        })
      }
    })
  })

  return true
}
