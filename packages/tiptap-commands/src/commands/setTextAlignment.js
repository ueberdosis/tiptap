import {
  findParentNode,
  isCellSelection,
  setCellAttrs,
  findCellClosestToPos,
  findChildrenByAttr,
} from 'prosemirror-utils'
import { nodeEqualsType } from 'tiptap-utils'

function dispatchTasks(tasks, align, selectionIsCell, tr, dispatch) {
  if (!tasks.length) {
    return false
  }

  let transformation = tr

  tasks.forEach(({ cell, node, pos }) => {
    if (cell) {
      transformation = setCellAttrs(cell, { align })(transformation)

      return
    }

    const attrs = {
      ...node.attrs,
      align: selectionIsCell
        ? align
        : null,
    }

    transformation = transformation.setNodeMarkup(pos, node.type, attrs, node.marks)
  })

  if (dispatch) {
    dispatch(transformation)
  }

  return true
}

export default function setTextAlignment(type, attrs = {}) {
  return (state, dispatch) => {
    const {
      doc,
      selection,
    } = state

    if (!selection || !doc) {
      return false
    }

    const {
      paragraph,
      heading,
      blockquote,
      list_item: listItem,
      table_cell: tableCell,
      table_header: tableHeader,
    } = state.schema.nodes
    const { ranges } = selection
    let { tr } = state

    const selectionIsCell = isCellSelection(selection)
    const alignment = attrs.align || null

    // If there is no text selected, or the text is within a single node
    if (selection.empty
      || (ranges.length === 1
      && ranges[0].$from.parent.eq(ranges[0].$to.parent)
      && !selectionIsCell)
    ) {
      const { depth, parent } = selection.$from
      const predicateTypes = depth > 1 && nodeEqualsType({ node: parent, types: paragraph })
        ? [blockquote, listItem, tableCell, tableHeader]
        : parent.type
      const predicate = node => nodeEqualsType({ node, types: predicateTypes })

      const {
        pos,
        node: {
          type: nType,
          attrs: nAttrs,
          marks: nMarks,
        },
      } = findParentNode(predicate)(selection)

      tr = tr.setNodeMarkup(pos, nType, { ...nAttrs, align: alignment }, nMarks)

      if (dispatch) {
        dispatch(tr)
      }

      return true
    }

    const tasks = []

    if (selectionIsCell) {
      const tableTypes = [tableHeader, tableCell]

      ranges.forEach(range => {
        const {
          $from: { parent: fromParent },
          $to: { parent: toParent },
        } = range

        if (!fromParent.eq(toParent)
          || !range.$from.sameParent(range.$to)
          || !nodeEqualsType({ node: fromParent, types: tableTypes })
          || !nodeEqualsType({ node: toParent, types: tableTypes })
        ) {
          return
        }

        if (fromParent.attrs.align !== alignment) {
          tasks.push({
            node: fromParent,
            pos: range.$from.pos,
            cell: findCellClosestToPos(range.$from),
          })
        }

        const predicate = ({ align }) => typeof align !== 'undefined' && align !== null

        findChildrenByAttr(fromParent, predicate, true)
          .forEach(({ node, pos }) => {
            if (!nodeEqualsType({ node, types: [paragraph, heading, blockquote, listItem] })) {
              return
            }

            tasks.push({
              node,
              pos: range.$from.pos + pos,
            })
          })
      })

      return dispatchTasks(tasks, alignment, true, tr, dispatch)
    }

    doc.nodesBetween(selection.from, selection.to, (node, pos) => {
      if (!nodeEqualsType({ node, types: [paragraph, heading, blockquote, listItem] })) {
        return true
      }

      const align = node.attrs.align || null

      if (align === alignment) {
        return true
      }

      tasks.push({
        node,
        pos,
      })

      return nodeEqualsType({ node, types: [paragraph, heading] })
    })

    return dispatchTasks(tasks, alignment, true, tr, dispatch)
  }
}
