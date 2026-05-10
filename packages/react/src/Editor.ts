import { Editor as CoreEditor } from '@tiptap/core'
import type { EditorState } from '@tiptap/pm/state'
import type { ReactPortal } from 'react'

import type { ReactRenderer } from './ReactRenderer.js'

export class Editor extends CoreEditor {
  contentComponent: ContentComponent | null = null

  isEditorContentInitialized = false

  /**
   * Batch portal store notifications so React-backed node views can mount in a
   * single store update for each ProseMirror view update.
   */
  protected override updateViewState(state: EditorState): void {
    this.contentComponent?.beginTransactionRenderBatch()

    try {
      super.updateViewState(state)
    } finally {
      this.contentComponent?.endTransactionRenderBatch()
    }
  }
}

export type EditorWithContentComponent = Editor
export type ContentComponent = {
  /**
   * Begins batching renderer store updates until `endTransactionRenderBatch`
   * is called.
   */
  beginTransactionRenderBatch(): void
  /**
   * Returns whether a transaction render batch is currently active.
   */
  isTransactionRenderBatchActive(): boolean
  /**
   * Ends the current renderer store batch and flushes any pending subscriber
   * notifications.
   */
  endTransactionRenderBatch(): void
  setRenderer(id: string, renderer: ReactRenderer): void
  removeRenderer(id: string): void
  subscribe: (callback: () => void) => () => void
  getSnapshot: () => Record<string, ReactPortal>
  getServerSnapshot: () => Record<string, ReactPortal>
}
