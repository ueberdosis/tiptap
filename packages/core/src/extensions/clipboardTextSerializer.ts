import { Plugin, PluginKey } from 'prosemirror-state'
import { Extension } from '../Extension'
import getTextBetween from '../helpers/getTextBetween'
import getTextSeralizersFromSchema from '../helpers/getTextSeralizersFromSchema'

export const ClipboardTextSerializer = Extension.create({
  name: 'editable',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('clipboardTextSerializer'),
        props: {
          clipboardTextSerializer: () => {
            const { editor } = this
            const { state, schema } = editor
            const { doc, selection } = state
            const { from, to } = selection
            const textSerializers = getTextSeralizersFromSchema(schema)
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
