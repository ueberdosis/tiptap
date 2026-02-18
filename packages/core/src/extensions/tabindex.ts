import { Plugin, PluginKey } from '@tiptap/pm/state'

import { Extension } from '../Extension.js'

export const Tabindex = Extension.create({
  name: 'tabindex',

  addOptions() {
    return {
      value: undefined,
    }
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('tabindex'),
        props: {
          attributes: (): { [name: string]: string } => (this.editor.isEditable ? { tabindex: this.options.value ?? '0' } : {}),
        },
      }),
    ]
  },
})
