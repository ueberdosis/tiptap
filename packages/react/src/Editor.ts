import { Editor as CoreEditor } from '@tiptap/core'
import React from 'react'

import { EditorContentProps, EditorContentState } from './EditorContent.js'
import { ReactRenderer } from './ReactRenderer.js'

type ContentComponent = React.Component<EditorContentProps, EditorContentState> & {
  setRenderer(id: string, renderer: ReactRenderer): void;
  removeRenderer(id: string): void;
}

export class Editor extends CoreEditor {
  public contentComponent: ContentComponent | null = null
}
