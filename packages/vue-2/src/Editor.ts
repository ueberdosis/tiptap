import { Editor as CoreEditor } from '@tiptap/editor'
import type Vue from 'vue'

export class Editor extends CoreEditor {
  public contentComponent: Vue | null = null
}
