import React from 'react'
import { Editor as CoreEditor } from '@tiptap/core'

export class Editor extends CoreEditor {
  public contentComponent: React.Component | null = null
}
