import type { Editor } from '@tiptap/core'
import { getSelectionRanges, NodeRangeSelection } from '@tiptap/extension-node-range'
import type { SelectionRange } from '@tiptap/pm/state'

import { cloneElement } from './cloneElement.js'
import { findElementNextToCoords } from './findNextElementFromCursor.js'
import { getEditor } from './getEditor.js'
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

function dragEnd(_: DragEvent, editor: Editor) {
  // reset the dragging, otherwise wrong content after dragging across multi editors repeatedly
  editor.view.dragging = null
}

function drop(event: DragEvent, editor: Editor) {
  const dragEditor = editor
  const dropEditor = getEditor(event.target as HTMLElement)

  // Check if we're dropping into a different editor
  const isDifferentEditor = dropEditor && dragEditor.instanceId !== dropEditor.instanceId

  // If dropping into a different editor (cross-editor), delete from source
  if (isDifferentEditor) {
    // Use the current selection that was set during drag start
    const selection = dragEditor.state.selection
    if (!selection.empty) {
      dragEditor.commands.deleteRange(selection)
    }
  }

  event.dataTransfer?.clearData()
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

  // Use ProseMirror default serializer
  const { dom, text } = view.serializeForClipboard(slice)
  event.dataTransfer.clearData()
  event.dataTransfer.setData('text/html', dom.innerHTML)
  event.dataTransfer.setData('text/plain', text)
  event.dataTransfer.setDragImage(wrapper, 0, 0)

  // tell ProseMirror the dragged content
  view.dragging = { slice, move: true }

  tr.setSelection(selection)

  view.dispatch(tr)

  const cleanup = (e: DragEvent) => {
    removeNode(wrapper)
    drop(e, editor)
  }

  // clean up
  document.addEventListener('dragend', e => dragEnd(e, editor))
  // remove the event listener after the drop event is triggered to avoid deleting the selection multiple times
  document.addEventListener('drop', cleanup, { once: true })
}
