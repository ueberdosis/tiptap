import { type Editor, isAndroid, isiOS } from '@tiptap/core'
import type { EditorView } from '@tiptap/pm/view'

import { dispatchEnterKey } from './dispatchEnterKey.js'
import { flushDOMChanges } from './flushDOMChanges.js'
import { getSelectionContentDOM } from './getSelectionContentDOM.js'

type MobileEditorView = EditorView & {
  input: { lastKeyCode: number | null; lastIOSEnter: number; lastIOSEnterFallbackTimeout: number }
}

export function handleMobileEnter(editor: Editor, event: InputEvent): void {
  if (
    editor.isDestroyed ||
    event.defaultPrevented ||
    !event.cancelable ||
    !editor.isEditable ||
    (event.inputType !== 'insertParagraph' && event.inputType !== 'insertLineBreak') ||
    (!isiOS() && !isAndroid())
  ) {
    return
  }

  const view = editor.view as MobileEditorView

  if (!getSelectionContentDOM(view)) {
    return
  }

  const lastKeyCode = view.input.lastKeyCode

  // Prevent the Android selection flush from handling Enter at the old caret.
  if (lastKeyCode === 13) {
    view.input.lastKeyCode = null
  }

  // Commit pending text before the Enter handler reads the selection.
  flushDOMChanges(view)

  if (dispatchEnterKey(view, event.inputType === 'insertLineBreak')) {
    event.preventDefault()
    // Prevent the iOS fallback from handling this Enter a second time.
    view.input.lastIOSEnter = 0
    clearTimeout(view.input.lastIOSEnterFallbackTimeout)
  } else if (lastKeyCode === 13) {
    view.input.lastKeyCode = lastKeyCode
  }
}
