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
            const textSerializers = getTextSerializersFromSchema(schema)
            const { blockSeparator } = this.options
            const options = {
              ...(blockSeparator !== undefined ? { blockSeparator } : {}),
              textSerializers,
            }

            // Serialize each selection range independently and join the results.
            // CellSelection exposes one range per selected cell; flattening to
            // min(from)/max(to) would pull in unselected cells between them.
            // Sort by document position so reverse selections (e.g. dragging
            // upward) still emit text in document order.
            const sortedRanges = [...selection.ranges].sort((a, b) => a.$from.pos - b.$from.pos)

            return sortedRanges
              .map(({ $from, $to }) =>
                getTextBetween(doc, { from: $from.pos, to: $to.pos }, options),
              )
              .join(blockSeparator ?? '\n\n')
          },
        },
      }),
    ]
  },
})
