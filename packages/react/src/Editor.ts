import React from 'react'
import { Editor as CoreEditor } from '@tiptap/core'
import { EditorContentProps, EditorContentState } from './EditorContent'

export class Editor extends CoreEditor {
  public contentComponent: React.Component<EditorContentProps, EditorContentState> | null = null
}
