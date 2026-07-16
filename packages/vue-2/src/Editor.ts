import type { AnyExtension } from '@tiptap/core'
import { Editor as CoreEditor } from '@tiptap/core'
import type Vue from 'vue'

export class Editor<
  const TExtensions extends readonly AnyExtension[] = AnyExtension[],
> extends CoreEditor<TExtensions> {
  public contentComponent: Vue | null = null
}
