import { type Editor, isAndroid } from '@tiptap/core'
import type { Fragment, Node as ProseMirrorNode } from '@tiptap/pm/model'
import { Slice } from '@tiptap/pm/model'
import { TextSelection } from '@tiptap/pm/state'

import { dispatchEnterKey } from './dispatchEnterKey.js'
import { type FlushingEditorView, flushDOMChanges } from './flushDOMChanges.js'
import { getSelectionContentDOM } from './getSelectionContentDOM.js'

/** The document and the text after the caret, saved before the browser splits the content natively. */
export interface CompositionEnter {
  contentDOM: HTMLElement
  doc: ProseMirrorNode
  position: number
  tail: Fragment
}

const endsWithNewline = (data: string | null) => data?.endsWith('\n') ?? false

function isCompositionEnter(editor: Editor, event: InputEvent): boolean {
  if (event.inputType !== 'insertCompositionText' || !endsWithNewline(event.data)) {
    return false
  }

  return isAndroid() && !editor.isDestroyed && editor.isEditable
}

/**
 * Saves the text after the caret when an Android keyboard sends Enter as part of a composition.
 * Returns `null` for any other input.
 */
export function captureCompositionEnter(
  editor: Editor,
  event: InputEvent,
): CompositionEnter | null {
  if (!isCompositionEnter(editor, event)) {
    return null
  }

  const view = editor.view as FlushingEditorView
  const contentDOM = getSelectionContentDOM(view)

  if (!contentDOM) {
    return null
  }

  // Commit only a scheduled flush, a full read would move the caret to the composition start
  view.domObserver.forceFlush()

  const { $from, empty } = view.state.selection

  if (!empty || !$from.parent.isTextblock) {
    return null
  }

  return {
    contentDOM,
    doc: view.state.doc,
    position: $from.pos,
    tail: $from.parent.content.cut($from.parentOffset),
  }
}

function removeSplitCopies(contentDOM: HTMLElement): void {
  Array.from(contentDOM.parentElement?.children ?? [])
    .filter(
      element => element !== contentDOM && element.hasAttribute('data-node-view-content-react'),
    )
    .forEach(element => element.remove())
}

/**
 * Restores the text that the native split removed and runs the Enter handlers.
 * Does nothing unless exactly that text is missing from the document.
 */
function repairCompositionEnter(editor: Editor, saved: CompositionEnter): void {
  if (editor.isDestroyed) {
    return
  }

  const { view } = editor
  const { contentDOM, doc, position, tail } = saved

  flushDOMChanges(view)

  if (!view.state.doc.eq(doc.replace(position, position + tail.size, Slice.empty))) {
    return
  }

  removeSplitCopies(contentDOM)

  const transaction = view.state.tr.insert(position, tail)

  view.dispatch(transaction.setSelection(TextSelection.create(transaction.doc, position)))
  dispatchEnterKey(view)
}

/** Schedules the repair once ProseMirror has ended the composition. */
export function handleCompositionEnterEnd(
  editor: Editor,
  event: CompositionEvent,
  saved: CompositionEnter | null,
): void {
  if (!saved || !endsWithNewline(event.data)) {
    return
  }

  queueMicrotask(() => repairCompositionEnter(editor, saved))
}
