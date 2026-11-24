import { type Editor, isAndroid, isiOS } from '@tiptap/core'
import type { EditorView } from '@tiptap/pm/view'

type MobileEditorView = EditorView & {
  domObserver: { forceFlush: () => void; flush: () => void }
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
  const root = view.root as (Document | ShadowRoot) & { getSelection?: () => Selection | null }
  const selection = root.getSelection?.() ?? view.dom.ownerDocument.getSelection()
  const anchor = selection?.anchorNode
  const element = anchor?.nodeType === 1 ? (anchor as Element) : anchor?.parentElement
  const contentDOM = element?.closest('[data-node-view-content-react]')

  if (!contentDOM || !view.dom.contains(contentDOM)) {
    return
  }

  const lastKeyCode = view.input.lastKeyCode

  // Prevent the Android selection flush from handling Enter at the old caret.
  if (lastKeyCode === 13) {
    view.input.lastKeyCode = null
  }

  // Commit pending text before the Enter handler reads the selection.
  view.domObserver.forceFlush()
  view.domObserver.flush()

  const keyEvent = new KeyboardEvent('keydown', {
    key: 'Enter',
    code: 'Enter',
    keyCode: 13,
    shiftKey: event.inputType === 'insertLineBreak',
    bubbles: true,
    cancelable: true,
  })

  if (view.someProp('handleKeyDown', handleKeyDown => handleKeyDown(view, keyEvent))) {
    event.preventDefault()
    // Prevent the iOS fallback from handling this Enter a second time.
    view.input.lastIOSEnter = 0
    clearTimeout(view.input.lastIOSEnterFallbackTimeout)
  } else if (lastKeyCode === 13) {
    view.input.lastKeyCode = lastKeyCode
  }
}
