import type { Editor } from '@tiptap/core'

import type { ReactNodeView } from './ReactNodeViewRenderer.js'

/**
 * One selection listener per editor, instead of one per node view.
 */
class ReactNodeViewSelectionManager {
  private editor: Editor

  private views = new Set<ReactNodeView<any>>()

  private rafId: number | null = null

  constructor(editor: Editor) {
    this.editor = editor
  }

  register(view: ReactNodeView<any>) {
    if (this.views.size === 0) {
      this.editor.on('selectionUpdate', this.handleSelectionUpdate)
    }

    this.views.add(view)
  }

  unregister(view: ReactNodeView<any>) {
    this.views.delete(view)

    if (this.views.size > 0) {
      return
    }

    this.editor.off('selectionUpdate', this.handleSelectionUpdate)

    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
  }

  private handleSelectionUpdate = () => {
    if (this.rafId !== null) {
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

export function getReactNodeViewSelectionManager(editor: Editor): ReactNodeViewSelectionManager {
  let manager = managers.get(editor)

  if (!manager) {
    manager = new ReactNodeViewSelectionManager(editor)
    managers.set(editor, manager)
  }

  return manager
}
