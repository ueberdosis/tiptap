import { Editor as CoreEditor } from '@tiptap/core'
import Vue from 'vue'

declare module '@tiptap/core' {
  interface Editor {
    contentComponent: Vue | null,
  }
}

export class Editor extends CoreEditor {
  public contentComponent: Vue | null = null
}
