import type { Editor } from '@tiptap/core'
import { NodeSelection } from '@tiptap/pm/state'

import type { NodeViewDesc } from './viewdesc.js'

const FORM_TAGS = ['INPUT', 'BUTTON', 'SELECT', 'TEXTAREA']

/**
 * Shared dependencies for the default node view event handlers below.
 * Events fire long after the render that built a handler, so the desc is
 * resolved lazily instead of being passed by value.
 */
export interface NodeViewEventDeps {
  editor: Editor | null
  /** Resolves the node view's desc from the live tree at event time. */
  getDesc: () => NodeViewDesc | undefined
}

export interface DefaultStopEventDeps extends NodeViewEventDeps {
  /** Shared drag bookkeeping between stopEvent calls. */
  isDraggingRef: { current: boolean }
}

interface EventKind {
  drag: boolean
  dragOverEnter: boolean
  drop: boolean
  clipboard: boolean
  click: boolean
}

const classifyEvent = (event: Event): EventKind => ({
  drag: event.type.startsWith('drag'),
  dragOverEnter: event.type === 'dragover' || event.type === 'dragenter',
  drop: event.type === 'drop',
  clipboard: event.type === 'copy' || event.type === 'paste' || event.type === 'cut',
  click: event.type === 'mousedown',
})

const isFormControl = (target: HTMLElement): boolean =>
  FORM_TAGS.includes(target.tagName) || target.isContentEditable

/** Events from outside the view or from inside contentDOM belong to PM. */
const isOutsideView = (dom: HTMLElement, desc: NodeViewDesc, target: HTMLElement): boolean =>
  !dom.contains(target) || !!desc.contentDOM?.contains(target)

// any input event within node views should be ignored by ProseMirror
const stopsFormControlEvent = (target: HTMLElement, kind: EventKind): boolean =>
  isFormControl(target) && !kind.drop && !kind.drag

// these events are handled by ProseMirror
const belongsToProseMirror = (
  kind: EventKind,
  wasDragging: boolean,
  selectable: boolean,
): boolean =>
  wasDragging || kind.dragOverEnter || kind.drop || kind.clipboard || (kind.click && selectable)

/** Records that a drag started from a drag handle, until it settles. */
const rememberDragHandle = (
  dom: HTMLElement,
  target: HTMLElement,
  isDraggingRef: { current: boolean },
): void => {
  const dragHandle = target.closest('[data-drag-handle]')

  if (!dragHandle || (dom !== dragHandle && !dom.contains(dragHandle))) {
    return
  }
  isDraggingRef.current = true

  const stopDragging = () => {
    isDraggingRef.current = false
  }

  document.addEventListener('dragend', stopDragging, { once: true })
  document.addEventListener('drop', stopDragging, { once: true })
  document.addEventListener('mouseup', stopDragging, { once: true })
}

interface DragFlags {
  draggable: boolean
  selectable: boolean
  dragging: boolean
}

// ProseMirror tries to drag selectable nodes even when `draggable` is
// false; prevent that
const preventSelectableNodeDrag = (event: Event, dom: HTMLElement, flags: DragFlags): void => {
  if (!flags.draggable && flags.selectable && event.target === dom) {
    event.preventDefault()
  }
}

const blocksUnstartedDrag = (event: Event, dom: HTMLElement, flags: DragFlags): boolean =>
  flags.draggable && !flags.dragging && event.target === dom

interface DragGuardArgs {
  event: Event
  kind: EventKind
  dom: HTMLElement
  desc: NodeViewDesc
  editor: Editor
  isDraggingRef: { current: boolean }
  target: HTMLElement
}

/** Drag handling ported from core; a boolean is a final stopEvent verdict. */
const applyDragGuards = ({
  event,
  kind,
  dom,
  desc,
  editor,
  isDraggingRef,
  target,
}: DragGuardArgs): boolean | undefined => {
  const flags: DragFlags = {
    draggable: !!desc.node.type.spec.draggable,
    selectable: NodeSelection.isSelectable(desc.node),
    dragging: isDraggingRef.current,
  }

  if (kind.drag) {
    preventSelectableNodeDrag(event, dom, flags)
    if (blocksUnstartedDrag(event, dom, flags)) {
      event.preventDefault()
      return false
    }
  }

  if (kind.click && flags.draggable && editor.isEditable && !flags.dragging) {
    rememberDragHandle(dom, target, isDraggingRef)
  }

  return undefined
}

/**
 * Default `stopEvent`, ported from core's NodeView: keep form control input
 * away from ProseMirror, let drag/clipboard/selection events through.
 */
export const createDefaultStopEvent = ({
  editor,
  getDesc,
  isDraggingRef,
}: DefaultStopEventDeps): ((event: Event) => boolean) => {
  return event => {
    const desc = getDesc()
    const dom = desc?.dom as HTMLElement | undefined
    const target = event.target as HTMLElement

    if (!editor || !desc || !dom || isOutsideView(dom, desc, target)) {
      return false
    }

    const kind = classifyEvent(event)

    if (stopsFormControlEvent(target, kind)) {
      return true
    }

    const wasDragging = isDraggingRef.current
    const verdict = applyDragGuards({ event, kind, dom, desc, editor, isDraggingRef, target })

    if (verdict !== undefined) {
      return verdict
    }

    return !belongsToProseMirror(kind, wasDragging, NodeSelection.isSelectable(desc.node))
  }
}

export interface DragStartHandlerDeps extends NodeViewEventDeps {
  getPos: () => number | undefined
}

/** `closest` is not available for text nodes, go through the parent then. */
const findDragHandle = (target: HTMLElement): Element | null | undefined =>
  target.nodeType === 3
    ? target.parentElement?.closest('[data-drag-handle]')
    : target.closest('[data-drag-handle]')

/** Offsets the drag image when the handle is not the node's own element. */
const dragImageOffset = (event: DragEvent, dom: HTMLElement, dragHandle: Element) => {
  if (dom === dragHandle) {
    return { x: 0, y: 0 }
  }

  const domBox = dom.getBoundingClientRect()
  const handleBox = dragHandle.getBoundingClientRect()

  // In React, we have to go through nativeEvent to reach offsetX/offsetY
  const offsetX = event.offsetX ?? (event as any).nativeEvent?.offsetX
  const offsetY = event.offsetY ?? (event as any).nativeEvent?.offsetY

  return { x: handleBox.x - domBox.x + offsetX, y: handleBox.y - domBox.y + offsetY }
}

/** Clones the node's DOM as a size-preserving drag image. */
const setDragImage = (event: DragEvent, dom: HTMLElement, x: number, y: number): void => {
  const clonedNode = dom.cloneNode(true) as HTMLElement

  try {
    const domBox = dom.getBoundingClientRect()

    clonedNode.style.width = `${Math.round(domBox.width)}px`
    clonedNode.style.height = `${Math.round(domBox.height)}px`
    clonedNode.style.boxSizing = 'border-box'
    clonedNode.style.pointerEvents = 'none'
  } catch {
    // ignore measurement errors (e.g. if element not in DOM)
  }

  // Safari requires the setDragImage element to be in the DOM; a detached
  // node can end the drag immediately
  let dragImageWrapper: HTMLElement | null = null

  try {
    dragImageWrapper = document.createElement('div')
    dragImageWrapper.style.position = 'absolute'
    dragImageWrapper.style.top = '-9999px'
    dragImageWrapper.style.left = '-9999px'
    dragImageWrapper.style.pointerEvents = 'none'
    dragImageWrapper.appendChild(clonedNode)
    document.body.appendChild(dragImageWrapper)

    event.dataTransfer?.setDragImage(clonedNode, x, y)
  } finally {
    // Remove on the next tick so the browser can still read the drag image
    if (dragImageWrapper) {
      setTimeout(() => {
        dragImageWrapper?.remove()
      }, 0)
    }
  }
}

/**
 * Default `dragstart` handler, ported from core's NodeView: drags starting
 * on a `[data-drag-handle]` get a drag image and node-select the node.
 */
export const createNodeViewDragStartHandler = ({
  editor,
  getDesc,
  getPos,
}: DragStartHandlerDeps): ((event: DragEvent) => void) => {
  return event => {
    const desc = getDesc()
    const dom = desc?.dom as HTMLElement | undefined
    const target = event.target as HTMLElement

    if (!editor || !dom) {
      return
    }

    const dragHandle = findDragHandle(target)

    if (desc?.contentDOM?.contains(target) || !dragHandle) {
      return
    }

    const { x, y } = dragImageOffset(event, dom, dragHandle)

    setDragImage(event, dom, x, y)

    const pos = getPos()

    if (typeof pos !== 'number') {
      return
    }

    // node-select the node so ProseMirror moves it as a whole
    const { view } = editor

    view.dispatch(view.state.tr.setSelection(NodeSelection.create(view.state.doc, pos)))
  }
}
