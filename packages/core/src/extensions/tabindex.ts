import { Plugin, PluginKey } from 'prosemirror-state'
import { Extension } from '../Extension'

export const Tabindex = Extension.create({
  name: 'tabindex',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('tabindex'),
        props: {
          attributes: () => {
            if (this.editor.isEditable) {
              return {
                tabindex: '0',
              }
            }
          },
        },
      }),
    ]
  },
})
