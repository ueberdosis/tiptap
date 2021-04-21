import { NodeType, MarkType } from 'prosemirror-model'
import getNodeType from '../helpers/getNodeType'
import getMarkType from '../helpers/getMarkType'
import getSchemaTypeNameByName from '../helpers/getSchemaTypeNameByName'
import { Command, RawCommands } from '../types'

declare module '@tiptap/core' {
  interface Commands {
    updateAttributes: {
      /**
       * Update attributes of a node or mark.
       */
      updateAttributes: (typeOrName: string | NodeType | MarkType, attributes: Record<string, any>) => Command,
    }
  }
}

export const updateAttributes: RawCommands['updateAttributes'] = (typeOrName, attributes = {}) => ({ tr, state, dispatch }) => {
  let nodeType: NodeType | null = null
  let markType: MarkType | null = null

  const schemaType = getSchemaTypeNameByName(
    typeof typeOrName === 'string'
      ? typeOrName
      : typeOrName.name,
    state.schema,
  )

  if (!schemaType) {
    return false
  }

  if (schemaType === 'node') {
    nodeType = getNodeType(typeOrName as NodeType, state.schema)
  }

  if (schemaType === 'mark') {
    markType = getMarkType(typeOrName as MarkType, state.schema)
  }

  if (dispatch) {
    tr.selection.ranges.forEach(range => {
      state.doc.nodesBetween(range.$from.pos, range.$to.pos, (node, pos) => {
        if (nodeType && nodeType === node.type) {
          tr.setNodeMarkup(pos, undefined, {
            ...node.attrs,
            ...attributes,
          })
        }

        if (markType && node.marks.length) {
          node.marks.forEach(mark => {
            if (markType === mark.type) {
              tr.addMark(pos, pos + node.nodeSize, markType.create({
                ...mark.attrs,
                ...attributes,
              }))
            }
          })
        }
      })
    })
  }

  return true
}
