import { type Editor, isAndroid } from '@tiptap/core'
import type { Fragment } from '@tiptap/pm/model'
import type { Transaction } from '@tiptap/pm/state'
import { TextSelection } from '@tiptap/pm/state'
import { Mapping } from '@tiptap/pm/transform'

import { dispatchEnterKey } from './dispatchEnterKey.js'
import { type FlushingEditorView, flushDOMChanges } from './flushDOMChanges.js'
import { getSelectionContentDOM } from './getSelectionContentDOM.js'

/** The caret and the text after it, saved before the browser splits the content natively. */
interface CompositionEnter {
  blockStart: number
  contentDOM: HTMLElement
  /** Every change made to the document since the caret was saved. */
  mapping: Mapping
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

/** Saves the caret and the text after it when an Android keyboard sends Enter inside a composition. */
function captureCompositionEnter(editor: Editor, event: InputEvent): CompositionEnter | null {
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
    blockStart: $from.start(),
    contentDOM,
    mapping: new Mapping(),
    position: $from.pos,
    tail: $from.parent.content.cut($from.parentOffset),
  }
}

/** Checks that the paragraph still exists and that nothing was inserted at the caret, like a split. */
function isCaretUnhandled({ blockStart, mapping, position }: CompositionEnter): boolean {
  const caret = mapping.mapResult(position, 1)
  const insertedAtCaret = !caret.deleted && mapping.map(position, -1) !== caret.pos

  return !mapping.mapResult(blockStart, -1).deleted && !insertedAtCaret
}

/** Checks that the native split removed exactly the text after the caret, and nothing else changed it. */
function isTailLost({ mapping, position, tail }: CompositionEnter): boolean {
  return mapping.map(position, 1) === mapping.map(position + tail.size, 1)
}

function removeSplitCopies(contentDOM: HTMLElement): void {
  Array.from(contentDOM.parentElement?.children ?? [])
    .filter(
      element => element !== contentDOM && element.hasAttribute('data-node-view-content-react'),
    )
    .forEach(element => element.remove())
}

/** Restores the text after the caret that the native split removed and runs the Enter handlers. */
function repairCompositionEnter(editor: Editor, saved: CompositionEnter): void {
  if (editor.isDestroyed) {
    return
  }

  const { view } = editor

  flushDOMChanges(view)

  // Leave every other case to ProseMirror, which handles some native splits after the composition
  if (!isCaretUnhandled(saved) || !isTailLost(saved)) {
    return
  }

  const position = saved.mapping.map(saved.position, 1)
  const transaction = view.state.tr.insert(position, saved.tail)

  removeSplitCopies(saved.contentDOM)
  view.dispatch(transaction.setSelection(TextSelection.create(transaction.doc, position)))
  dispatchEnterKey(view)
}

/** Follows one Enter that an Android keyboard sends inside a composition, from `beforeinput` to its repair. */
export function createCompositionEnterTracker(editor: Editor) {
  let saved: CompositionEnter | null = null

  return {
    beforeInput(event: InputEvent): void {
      saved = captureCompositionEnter(editor, event)
    },

    mapTransactions(transactions: readonly Transaction[]): void {
      transactions.forEach(transaction => saved?.mapping.appendMapping(transaction.mapping))
    },

    compositionEnd(event: CompositionEvent): void {
      const current = saved

      if (!current || !endsWithNewline(event.data)) {
        saved = null
        return
      }

      // Repair once ProseMirror has ended the composition
      queueMicrotask(() => {
        repairCompositionEnter(editor, current)

        if (saved === current) {
          saved = null
        }
      })
    },
  }
}
