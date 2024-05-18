import {
  Mark, MarkType, Node, NodeType,
} from '@tiptap/pm/model'
import { SelectionRange } from '@tiptap/pm/state'

import { getMarkType } from '../helpers/getMarkType.js'
import { getNodeType } from '../helpers/getNodeType.js'
import { getSchemaTypeNameByName } from '../helpers/getSchemaTypeNameByName.js'
import { RawCommands } from '../types.js'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    updateAttributes: {
      /**
       * Update attributes of a node or mark.
       * @param typeOrName The type or name of the node or mark.
       * @param attributes The attributes of the node or mark.
       * @example editor.commands.updateAttributes('mention', { userId: "2" })
       */
      updateAttributes: (
        /**
         * The type or name of the node or mark.
         */
        typeOrName: string | NodeType | MarkType,

        /**
         * The attributes of the node or mark.
         */
        attributes: Record<string, any>,
      ) => ReturnType
    }
  }
}

export const updateAttributes: RawCommands['updateAttributes'] = (typeOrName, attributes = {}) => ({ tr, state, dispatch }) => {
  let nodeType: NodeType | null = null
  let markType: MarkType | null = null

  const schemaType = getSchemaTypeNameByName(
    typeof typeOrName === 'string' ? typeOrName : typeOrName.name,
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
    let lastPos: number | undefined
    let lastNode: Node | undefined
    let trimmedFrom: number
    let trimmedTo: number

    tr.selection.ranges.forEach((range: SelectionRange) => {
      const from = range.$from.pos
      const to = range.$to.pos

      state.doc.nodesBetween(from, to, (node: Node, pos: number) => {
        if (nodeType && nodeType === node.type) {
          trimmedFrom = Math.max(pos, from)
          trimmedTo = Math.min(pos + node.nodeSize, to)
          lastPos = pos
          lastNode = node
        }
      })
    })

    if (lastNode) {

      if (lastPos !== undefined) {
        tr.setNodeMarkup(lastPos, undefined, {
          ...lastNode.attrs,
          ...attributes,
        })
      }

      if (markType && lastNode.marks.length) {
        lastNode.marks.forEach((mark: Mark) => {
          if (markType === mark.type) {
            tr.addMark(
              trimmedFrom,
              trimmedTo,
              markType.create({
                ...mark.attrs,
                ...attributes,
              }),
            )
          }
        })
      }
    }
  }

  return true
}
