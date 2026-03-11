import type { Editor } from '@tiptap/core'
import type { ReactPortal } from 'react'

import type { ReactRenderer } from './ReactRenderer.js'

export type PortalNode = {
  id: string
  portal: ReactPortal
  parentId: string | null
  children: string[]
}

export type EditorWithContentComponent = Editor & { contentComponent?: ContentComponent | null }
export type ContentComponent = {
  setRenderer(id: string, renderer: ReactRenderer, parentId?: string | null): void
  removeRenderer(id: string): void
  subscribe: (callback: () => void) => () => void
  getSnapshot: () => Record<string, PortalNode>
  getServerSnapshot: () => Record<string, PortalNode>
}
