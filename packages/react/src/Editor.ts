import { Editor } from '@tiptap/core'
import { ReactPortal } from 'react'

import { ReactRenderer } from './ReactRenderer.js'

export type EditorWithContentComponent = Editor & { contentComponent?: ContentComponent | null }
export type ContentComponent = {
  setRenderer(id: string, renderer: ReactRenderer): void;
  removeRenderer(id: string): void;
  subscribe: (callback: () => void) => () => void;
  getSnapshot: () => Record<string, ReactPortal>;
  getServerSnapshot: () => Record<string, ReactPortal>;
}
