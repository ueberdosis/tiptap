import { Editor as CoreEditor } from '@tiptap/core'
import type { VueConstructor } from 'vue/types/umd'

type Vue = InstanceType<VueConstructor>

export class Editor extends CoreEditor {
  public contentComponent: Vue | null = null
}
