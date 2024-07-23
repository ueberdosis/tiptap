import { Fragment, Node, Slice } from '@tiptap/pm/model'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { EditorView } from '@tiptap/pm/view'

import { isCellSelection } from '../../../extension-table/src/utilities/isCellSelection.js'
import { Extension } from '../Extension.js'
import { getTextBetween } from '../helpers/getTextBetween.js'
import { getTextSerializersFromSchema } from '../helpers/getTextSerializersFromSchema.js'

export type ClipboardTextSerializerOptions = {
  blockSeparator?: string,
}
interface _Fragment extends Fragment {
  content: Node[];
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
          clipboardTextSerializer: (content: Slice, view: EditorView) => {
            const { editor } = this
            const { state, schema } = editor
            const { doc, selection } = state
            const { ranges } = selection
            const from = Math.min(...ranges.map(range => range.$from.pos))
            const to = Math.max(...ranges.map(range => range.$to.pos))
            const textSerializers = getTextSerializersFromSchema(schema)
            const range = { from, to }

            if (isCellSelection(view.state.selection)) {
              const contentArray = (content.content as _Fragment).content
              let result = ''

              contentArray.forEach((tableRow:Node) => {
                const cellArr = (tableRow.content as _Fragment).content

                cellArr.forEach((cell:Node, cellIndex:Number) => {
                  result = `${result}   ${cell.textContent}   ${Number(cellIndex) === cellArr.length - 1 ? '\n' : ''}`
                })
              })
              return result
            }

            return getTextBetween(doc, range, {
              ...(this.options.blockSeparator !== undefined
                ? { blockSeparator: this.options.blockSeparator }
                : {}),
              textSerializers,
            })
          },
        },
      }),
    ]
  },
})
