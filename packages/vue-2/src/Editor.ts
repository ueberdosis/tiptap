import { Editor as CoreEditor } from '@tiptap/core'
import type Vue from 'vue'

/**
 * The editor, with the Vue bits it needs to render node views.
 */
export class Editor extends CoreEditor {
  public contentComponent: Vue | null = null
}
