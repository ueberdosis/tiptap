import type { EditorView } from '@tiptap/pm/view'

/** `EditorView` with the DOM observer that prosemirror-view does not expose in its types. */
export type FlushingEditorView = EditorView & {
  domObserver: { forceFlush: () => void; flush: () => void }
}

/** Reads pending DOM changes into the editor state right away. */
export function flushDOMChanges(view: EditorView): void {
  const { domObserver } = view as FlushingEditorView

  domObserver.forceFlush()
  domObserver.flush()
}
