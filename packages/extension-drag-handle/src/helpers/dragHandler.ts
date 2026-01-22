import type { Editor } from '@tiptap/core'
import { getSelectionRanges, NodeRangeSelection } from '@tiptap/extension-node-range'
import type { Node } from '@tiptap/pm/model'
import { type SelectionRange, NodeSelection } from '@tiptap/pm/state'

import type { NormalizedNestedOptions } from '../types/options.js'
import { cloneElement } from './cloneElement.js'
import { findElementNextToCoords } from './findNextElementFromCursor.js'
import { removeNode } from './removeNode.js'

export interface DragContext {
  node: Node | null
  pos: number
}

function getDragHandleRanges(
  event: DragEvent,
  editor: Editor,
  nestedOptions?: NormalizedNestedOptions,
  dragContext?: DragContext,
): SelectionRange[] {
  const { doc } = editor.view.state

  // In nested mode with known context, use the pre-calculated position
  // This prevents recalculation issues when mouse position shifts during drag start
  if (nestedOptions?.enabled && dragContext?.node && dragContext.pos >= 0) {
    const nodeStart = dragContext.pos
    const nodeEnd = dragContext.pos + dragContext.node.nodeSize

    return [
      {
        $from: doc.resolve(nodeStart),
        $to: doc.resolve(nodeEnd),
      },
    ]
  }

  // Fallback: recalculate from mouse position (used in non-nested mode)
  const result = findElementNextToCoords({
    editor,
    x: event.clientX,
    y: event.clientY,
    direction: 'right',
    nestedOptions,
  })

  if (!result.resultNode || result.pos === null) {
    return []
  }

  // For non-nested mode, use depth 0 to select the outermost block
  const $from = doc.resolve(result.pos)
  const $to = doc.resolve(result.pos + result.resultNode.nodeSize)

  return getSelectionRanges($from, $to, 0)
}

export function dragHandler(
  event: DragEvent,
  editor: Editor,
  nestedOptions?: NormalizedNestedOptions,
  dragContext?: DragContext,
) {
  const { view } = editor

  if (!event.dataTransfer) {
    return
  }

  const { empty, $from, $to } = view.state.selection

  const dragHandleRanges = getDragHandleRanges(event, editor, nestedOptions, dragContext)

  const selectionRanges = getSelectionRanges($from, $to, 0)
  const isDragHandleWithinSelection = selectionRanges.some(range => {
    return dragHandleRanges.find(dragHandleRange => {
      return dragHandleRange.$from === range.$from && dragHandleRange.$to === range.$to
    })
  })

  const ranges = empty || !isDragHandleWithinSelection ? dragHandleRanges : selectionRanges

  if (!ranges.length) {
    return
  }

  const { tr } = view.state
  const wrapper = document.createElement('div')
  const from = ranges[0].$from.pos
  const to = ranges[ranges.length - 1].$to.pos

  // For nested mode, create slice directly to avoid NodeRangeSelection expanding to parent
  const isNestedDrag = nestedOptions?.enabled && dragContext?.node

  let slice
  let selection

  if (isNestedDrag) {
    // Create slice directly from the exact positions
    slice = view.state.doc.slice(from, to)

    // Use NodeSelection for nested mode to select exactly the target node
    // NodeRangeSelection would expand to the parent
    selection = NodeSelection.create(view.state.doc, from)
  } else {
    selection = NodeRangeSelection.create(view.state.doc, from, to)
    slice = selection.content()
  }

  ranges.forEach(range => {
    const element = view.nodeDOM(range.$from.pos) as HTMLElement
    const clonedElement = cloneElement(element)

    wrapper.append(clonedElement)
  })

  wrapper.style.position = 'absolute'
  wrapper.style.top = '-10000px'
  document.body.append(wrapper)

  event.dataTransfer.clearData()
  event.dataTransfer.setDragImage(wrapper, 0, 0)

  // tell ProseMirror the dragged content
  view.dragging = { slice, move: true }

  tr.setSelection(selection)

  view.dispatch(tr)

  // clean up
  document.addEventListener('drop', () => removeNode(wrapper), { once: true })
}
