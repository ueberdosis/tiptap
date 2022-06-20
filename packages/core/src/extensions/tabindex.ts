import { Plugin, PluginKey } from 'prosemirror-state'

import { Extension } from '../Extension'

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
