import { Plugin } from '@tiptap/pm/state'
import type { EditorView } from '@tiptap/pm/view'

import { ReactEditorView } from '../ReactEditorView.js'
import { observeCompositionInput } from './composition.js'

/**
 * Non-public `EditorView` members this plugin uses, verified against
 * prosemirror-view 1.41.9:
 *
 * - `input.lastIOSEnter`: prosemirror-view defers Enter handling on iOS
 *   (Safari misbehaves when Enter's beforeinput is prevented). We handle
 *   Enter here ourselves, so zeroing the timestamp keeps the deferred
 *   handler from firing a second time.
 * - `domObserver.flush()`: reads the current DOM selection into the state
 *   when it differs from the observer's cache. `selectionchange` events are
 *   delivered asynchronously, so a key or beforeinput event can arrive
 *   before the user's latest cursor move reached the state; flushing first
 *   makes `state.selection` current before we act on it. Safe while the
 *   mutation observer is disabled: with no records queued, flush only
 *   performs the selection read.
 */
interface ViewInputInternals {
  input: { lastIOSEnter: number }
  domObserver: { flush(): void }
}

/** Syncs a not-yet-processed DOM selection change into the state. */
const flushPendingSelection = (view: EditorView): void => {
  // No DOM selection reads mid-composition or while descs await a commit
  if (view.composing) {
    return
  }
  if (view instanceof ReactEditorView && view.hasPendingCommit) {
    return
  }
  ;(view as unknown as ViewInputInternals).domObserver.flush()
}

const DELETE_INPUT_TYPES = new Set([
  'deleteContent',
  'deleteContentBackward',
  'deleteContentForward',
  'deleteWordBackward',
  'deleteWordForward',
  'deleteSoftLineBackward',
  'deleteSoftLineForward',
  'deleteHardLineBackward',
  'deleteHardLineForward',
])

const targetRanges = (event: InputEvent): StaticRange[] =>
  typeof event.getTargetRanges === 'function' ? event.getTargetRanges() : []

const rangeToPositions = (view: EditorView, range: StaticRange) => ({
  from: view.posAtDOM(range.startContainer, range.startOffset, 1),
  to: view.posAtDOM(range.endContainer, range.endOffset, 1),
})

/** Inserts text through `handleTextInput` (input rules) or a transaction. */
const insertText = (view: EditorView, text: string | null, from: number, to: number): void => {
  if (text === null) {
    return
  }

  const handled = view.someProp('handleTextInput', handler =>
    handler(view, from, to, text, () => view.state.tr.insertText(text, from, to)),
  )

  if (handled) {
    return
  }
  view.dispatch(view.state.tr.insertText(text, from, to))
}

/**
 * Inserts `text` into every target range. Positions are resolved before any
 * dispatch (the desc tree still describes the pre-edit DOM) and applied last
 * range first, so earlier positions stay valid across dispatches.
 */
const insertIntoRanges = (
  view: EditorView,
  text: string | null,
  ranges: readonly StaticRange[],
): void => {
  const positions = ranges.map(range => rangeToPositions(view, range))

  for (const { from, to } of positions.reverse()) {
    insertText(view, text, from, to)
  }
}

const insertTextFromEvent = (view: EditorView, event: InputEvent): void => {
  const ranges = targetRanges(event)

  if (ranges.length === 0 || (ranges.length === 1 && ranges[0].collapsed)) {
    const { from, to } = view.state.selection

    insertText(view, event.data, from, to)
    return
  }
  insertIntoRanges(view, event.data, ranges)
}

/** Runs Enter through the keymaps, as if the key had not been prevented. */
const handleEnter = (view: EditorView, event: InputEvent): boolean => {
  ;(view as unknown as ViewInputInternals).input.lastIOSEnter = 0

  const keyEvent = new KeyboardEvent('keydown', {
    bubbles: true,
    cancelable: true,
    key: 'Enter',
    code: 'Enter',
    keyCode: 13,
    shiftKey: event.inputType === 'insertLineBreak',
  })

  return view.someProp('handleKeyDown', handler => handler(view, keyEvent)) ?? false
}

const deleteRanges = (view: EditorView, event: InputEvent): void => {
  const { tr } = view.state

  for (const range of targetRanges(event)) {
    const raw = rangeToPositions(view, range)
    // Earlier deletes in this transaction shift later positions; map them
    const from = tr.mapping.map(raw.from)
    const to = tr.mapping.map(raw.to)
    const marks = tr.doc.resolve(from).marksAcross(tr.doc.resolve(to))

    tr.delete(from, to)
    if (marks) {
      tr.ensureMarks(marks)
    }
  }
  view.dispatch(tr)
}

const replaceText = (view: EditorView, event: InputEvent): void => {
  const ranges = targetRanges(event)

  // Chromium delivers the replacement asynchronously through dataTransfer;
  // Firefox spellcheck puts it directly on event.data
  if (event.dataTransfer) {
    event.dataTransfer.items[0]?.getAsString(text => insertIntoRanges(view, text, ranges))
    return
  }
  if (event.data != null) {
    insertIntoRanges(view, event.data, ranges)
  }
}

/**
 * Composition input stays with the browser; the composition plugin commits
 * it at compositionend. Undefined means: not composition input.
 */
const handleCompositionInput = (view: EditorView, event: InputEvent): boolean | undefined => {
  switch (event.inputType) {
    // Preedit mutations; not cancelable anyway
    case 'insertCompositionText':
    case 'deleteCompositionText':
      observeCompositionInput(view, event)
      return true
    // Safari's commit type: stash the data, compositionend commits once
    case 'insertFromComposition':
      event.preventDefault()
      observeCompositionInput(view, event)
      return true
    default:
      break
  }

  // Android fires generic insert/delete types mid-composition; fold them
  // into the record instead of dispatching against browser-owned DOM
  if (view.composing) {
    observeCompositionInput(view, event)
    return true
  }

  return undefined
}

/**
 * Drives editing input for the React-owned view. The DOM mutation observer is
 * disabled there (React owns the document DOM, so ProseMirror must not parse
 * DOM changes back), which means input has to be intercepted before the
 * browser mutates the DOM: every supported `beforeinput` is prevented and
 * re-expressed as a transaction. Composition input stays with the browser;
 * the composition plugin records it and commits at `compositionend`.
 */
export const beforeInput = (): Plugin =>
  new Plugin({
    props: {
      handleDOMEvents: {
        keydown: view => {
          // Keymaps read state.selection; sync the DOM selection first
          flushPendingSelection(view)
          return false
        },
        beforeinput: (view, event) => {
          // Custom DOM handlers run even when the view is not editable
          if (!view.editable) {
            return false
          }

          const compositionVerdict = handleCompositionInput(view, event)

          if (compositionVerdict !== undefined) {
            return compositionVerdict
          }

          flushPendingSelection(view)
          event.preventDefault()

          switch (event.inputType) {
            case 'insertParagraph':
            case 'insertLineBreak':
              return handleEnter(view, event)
            case 'insertText':
              insertTextFromEvent(view, event)
              return true
            case 'insertReplacementText':
              replaceText(view, event)
              return true
            default:
              if (DELETE_INPUT_TYPES.has(event.inputType)) {
                deleteRanges(view, event)
              }
              return true
          }
        },
      },
    },
  })
