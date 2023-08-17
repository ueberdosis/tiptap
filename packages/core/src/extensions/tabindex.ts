import { Plugin, PluginKey } from '@tiptap/pm/state'

import { Extension } from '../Extension.js'

export const Tabindex = Extension.create({
  name: 'tabindex',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('tabindex'),
        props: {
          attributes: this.editor.isEditable ? { tabindex: '0' } : {},
        },
      }),
    ]
  },
})
