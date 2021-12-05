import { Plugin, PluginKey } from 'prosemirror-state'
import { Extension } from '../Extension'
import getTextBetween from '../helpers/getTextBetween'
import getTextSeralizersFromSchema from '../helpers/getTextSeralizersFromSchema'

export const ClipboardTextSerializer = Extension.create({
  name: 'clipboardTextSerializer',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('clipboardTextSerializer'),
        props: {
          clipboardTextSerializer: () => {
            const { editor } = this
            const { state, schema } = editor
            const { doc, selection } = state
            const { ranges } = selection
            const from = Math.min(...ranges.map(range => range.$from.pos))
            const to = Math.max(...ranges.map(range => range.$to.pos))
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
