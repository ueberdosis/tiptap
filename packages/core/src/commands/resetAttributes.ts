import type { MarkType, NodeType } from '@tiptap/pm/model'

import { getMarkType } from '../helpers/getMarkType.js'
import { getNodeType } from '../helpers/getNodeType.js'
import { getSchemaTypeNameByName } from '../helpers/getSchemaTypeNameByName.js'
import type { RawCommands } from '../types.js'
import { deleteProps } from '../utilities/deleteProps.js'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    resetAttributes: {
      /**
       * Resets some node attributes to the default value.
       * @param typeOrName The type or name of the node.
       * @param attributes The attributes of the node to reset.
       * @example editor.commands.resetAttributes('heading', 'level')
       */
      resetAttributes: (typeOrName: string | NodeType | MarkType, attributes: string | string[]) => ReturnType
    }
  }
}

export const resetAttributes: RawCommands['resetAttributes'] =
  (typeOrName, attributes) =>
  ({ tr, state, dispatch }) => {
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
      tr.selection.ranges.forEach(range => {
        state.doc.nodesBetween(range.$from.pos, range.$to.pos, (node, pos) => {
          if (nodeType && nodeType === node.type) {
            tr.setNodeMarkup(pos, undefined, deleteProps(node.attrs, attributes))
          }

          if (markType && node.marks.length) {
            node.marks.forEach(mark => {
              if (markType === mark.type) {
                tr.addMark(pos, pos + node.nodeSize, markType.create(deleteProps(mark.attrs, attributes)))
              }
            })
          }
        })
      })
    }

    return true
  }
