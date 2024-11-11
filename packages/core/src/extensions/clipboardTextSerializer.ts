import { Plugin, PluginKey } from '@tiptap/pm/state'

import { Extension } from '../Extension.js'
import { getTextBetween } from '../helpers/getTextBetween.js'
import { getTextSerializersFromSchema } from '../helpers/getTextSerializersFromSchema.js'

export type ClipboardTextSerializerOptions = {
  blockSeparator?: string
}

export const ClipboardTextSerializer = Extension.create<ClipboardTextSerializerOptions>({
  name: 'clipboardTextSerializer',

  addOptions() {
    return {
      blockSeparator: undefined,
    }
  },

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
            const textSerializers = getTextSerializersFromSchema(schema)
            const range = { from, to }

            return getTextBetween(doc, range, {
              ...(this.options.blockSeparator !== undefined ? { blockSeparator: this.options.blockSeparator } : {}),
              textSerializers,
            })
          },
        },
      }),
    ]
  },
})
