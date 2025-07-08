import type { Editor } from '@tiptap/core'
import { getSelectionRanges, NodeRangeSelection } from '@tiptap/extension-node-range'
import type { SelectionRange } from '@tiptap/pm/state'

import { cloneElement } from './cloneElement.js'
import { findElementNextToCoords } from './findNextElementFromCursor.js'
import { getInnerCoords } from './getInnerCoords.js'
import { removeNode } from './removeNode.js'

function getDragHandleRanges(event: DragEvent, editor: Editor): SelectionRange[] {
  const { doc } = editor.view.state

  const result = findElementNextToCoords({
    editor,
    x: event.clientX,
    y: event.clientY,
    direction: 'right',
  })

  if (!result.resultNode || result.pos === null) {
    return []
  }

  const x = event.clientX

  // @ts-ignore
  const coords = getInnerCoords(editor.view, x, event.clientY)
  const posAtCoords = editor.view.posAtCoords(coords)

  if (!posAtCoords) {
    return []
  }

  const { pos } = posAtCoords
  const nodeAt = doc.resolve(pos).parent

  if (!nodeAt) {
    return []
  }

  const $from = doc.resolve(result.pos)
  const $to = doc.resolve(result.pos + 1)

  return getSelectionRanges($from, $to, 0)
}

export function dragHandler(event: DragEvent, editor: Editor) {
  const { view } = editor

  if (!event.dataTransfer) {
    return
  }

  const { empty, $from, $to } = view.state.selection

  const dragHandleRanges = getDragHandleRanges(event, editor)

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

  const selection = NodeRangeSelection.create(view.state.doc, from, to)
  const slice = selection.content()

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
