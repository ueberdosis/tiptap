import type { Editor } from '@tiptap/core'

import type { ReactNodeView } from './ReactNodeViewRenderer.js'

/**
 * One selection listener per editor, instead of one per node view.
 */
class ReactNodeViewSelectionManager {
  private views = new Set<ReactNodeView<any>>()

  private rafId: number | null = null

  constructor(editor: Editor) {
    editor.on('selectionUpdate', this.handleSelectionUpdate)
  }

  register(view: ReactNodeView<any>) {
    this.views.add(view)
  }

  unregister(view: ReactNodeView<any>) {
    this.views.delete(view)
  }

  private handleSelectionUpdate = () => {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId)
    }

    this.rafId = requestAnimationFrame(() => {
      this.rafId = null
      for (const view of this.views) {
        view.checkSelection()
      }
    })
  }
}

const managers = new WeakMap<Editor, ReactNodeViewSelectionManager>()

/** Reuses one manager per editor. */
export function getReactNodeViewSelectionManager(editor: Editor): ReactNodeViewSelectionManager {
  let manager = managers.get(editor)

  if (!manager) {
    manager = new ReactNodeViewSelectionManager(editor)
    managers.set(editor, manager)
  }

  return manager
}
