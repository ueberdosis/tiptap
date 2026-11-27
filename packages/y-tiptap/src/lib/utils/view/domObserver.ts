import type { EditorView } from 'prosemirror-view'

/**
 * The DOM observer surface prosemirror-view uses internally.
 * It is not part of the public types, so this module types the part we touch.
 */
export type DOMObserver = {
  currentSelection: {
    eq: (selection: {
      anchorNode: Node | null
      anchorOffset: number
      focusNode: Node | null
      focusOffset: number
    }) => boolean
  }
  flush: () => void
  pendingRecords: () => unknown[]
  start: () => void
  stop: () => void
}

/** Returns the view's DOM observer. */
export const getDOMObserver = (view: EditorView): DOMObserver =>
  (view as unknown as { domObserver: DOMObserver }).domObserver
