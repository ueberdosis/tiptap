import { Editor as CoreEditor } from '@tiptap/core'
import React from 'react'

import { ReactRenderer } from './ReactRenderer.js'

type ContentComponent = {
  setRenderer(id: string, renderer: ReactRenderer): void;
  removeRenderer(id: string): void;
  subscribe: (callback: () => void) => () => void;
  getSnapshot: () => Record<string, React.ReactPortal>;
  getServerSnapshot: () => Record<string, React.ReactPortal>;
}

export class Editor extends CoreEditor {
  public contentComponent: ContentComponent | null = null
}
