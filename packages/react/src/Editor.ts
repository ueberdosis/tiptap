import type { Editor } from '@tiptap/core'
import type { ReactPortal } from 'react'

import type { ReactRenderer } from './ReactRenderer.js'

/**
 * An editor that also holds the React component rendering its content.
 */
export type EditorWithContentComponent = Editor & {
  contentComponent?: ContentComponent | null
  isEditorContentInitialized?: boolean
}
/**
 * The component that renders the editor content.
 */
export type ContentComponent = {
  setRenderer(id: string, renderer: ReactRenderer): void
  removeRenderer(id: string): void
  subscribe: (callback: () => void) => () => void
  getSnapshot: () => Record<string, ReactPortal>
  getServerSnapshot: () => Record<string, ReactPortal>
}
