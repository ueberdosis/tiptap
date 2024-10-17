import { MarkType, NodeType } from '@tiptap/pm/model'

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

export const updateAttributes: RawCommands['updateAttributes'] = (typeOrName, attributes = {}) => ({ editor, tr, state, dispatch }) => {
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
    /*
     * If the user didn't select anything then start from the
     * current cursor, grab a NodePos, and find the closest
     * typeOrName from that NodePos
     */
    if (tr.selection.empty) {
      // get a NodePos
      const pos = editor.$pos(tr.selection.anchor)
      const node = pos.closest(nodeType.name)

      if (nodeType && nodeType === node.type) {
        tr.setNodeMarkup(node.pos-1, null, {
          ...node.node.attrs,
          ...attributes,
        })
      }

      if (markType && node.marks.length) {
        node.marks.forEach(mark => {
          if (markType === mark.type) {
            tr.addMark(
              pos,
              pos.node.nodeSize,
              markType.create({
                ...mark.attrs,
                ...attributes,
              }),
            )
          }
        })
      }
    } else {
      tr.selection.ranges.forEach(range => {
        /* If we have typeOrName == flexItem and something like the following
         * in the editor:
         * <someflexItemTag>
         *   <p>foo</p><p>bar</p>
         * </someflexItemTag>
         *
         * If we (text) select "ooba" from that part in
         * the editor the selection range would not include
         * the flexItem, so be sure to start from that node
         * pos.
         *
         * I'm not sure that this is the best way to do it
         * but.. it works. (I've to check the
         * prosemirror/tiptap documentation)
         */
        const from = editor.$pos(range.$from.pos).closest(nodeType.name).pos - 1

        const to = range.$to.pos

        state.doc.nodesBetween(from, to, (node, pos) => {
          if (nodeType && nodeType === node.type && pos >= from && pos <= to) {
            tr.setNodeMarkup(pos, undefined, {
              ...node.attrs,
              ...attributes,
            })
          }

          if (markType && node.marks.length) {
            node.marks.forEach(mark => {
              if (markType === mark.type) {
                const trimmedFrom = Math.max(pos, from)
                const trimmedTo = Math.min(pos + node.nodeSize, to)

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
        })
      })
    }
  }
  return true
}
