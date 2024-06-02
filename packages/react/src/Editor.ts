import { Editor as CoreEditor } from '@tiptap/core'

import { ReactRenderer } from './ReactRenderer.js'

type ContentComponent = {
  setRenderer(id: string, renderer: ReactRenderer): void;
  removeRenderer(id: string): void;
  subscribe: (callback: () => void) => () => void;
  getSnapshot: () => Record<string, ReactRenderer>;
  getServerSnapshot: () => Record<string, ReactRenderer>;
}

export class Editor extends CoreEditor {
  public contentComponent: ContentComponent | null = null
}
