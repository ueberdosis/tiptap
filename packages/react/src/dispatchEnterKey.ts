import type { EditorView } from '@tiptap/pm/view'

/** Runs the editor's Enter key handlers without a real key press. Returns whether one handled it. */
export function dispatchEnterKey(view: EditorView, shiftKey = false): boolean {
  const event = new KeyboardEvent('keydown', {
    key: 'Enter',
    code: 'Enter',
    keyCode: 13,
    shiftKey,
    bubbles: true,
    cancelable: true,
  })

  return view.someProp('handleKeyDown', handleKeyDown => handleKeyDown(view, event)) ?? false
}
