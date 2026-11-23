import type { EditorView } from '@tiptap/pm/view'

type FlushingEditorView = EditorView & {
  domObserver: { forceFlush: () => void; flush: () => void }
}

/** Reads pending DOM changes into the editor state right away. */
export function flushDOMChanges(view: EditorView): void {
  const { domObserver } = view as FlushingEditorView

  domObserver.forceFlush()
  domObserver.flush()
}
