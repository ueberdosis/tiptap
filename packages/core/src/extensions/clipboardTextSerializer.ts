import { Plugin, PluginKey } from 'prosemirror-state'
import { Extension } from '../Extension'
import getTextBetween from '../helpers/getTextBetween'

export const ClipboardTextSerializer = Extension.create({
  name: 'editable',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('clipboardTextSerializer'),
        props: {
          clipboardTextSerializer: () => {
            const { editor } = this
            const { state, extensionManager } = editor
            const { doc, selection } = state
            const { from, to } = selection
            const { textSerializers } = extensionManager
            const range = { from, to }

            return getTextBetween(doc, range, {
              textSerializers,
            })
          },
        },
      }),
    ]
  },
})
