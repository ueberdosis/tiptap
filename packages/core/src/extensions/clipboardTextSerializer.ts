import { Editor } from '@tiptap/core'
import { Plugin, PluginKey } from 'prosemirror-state'
import { Extension } from '../Extension'
import textBetween from '../utilities/textBetween';

export const ClipboardTextSerializer = Extension.create({
  name: 'editable',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('clipboardTextSerializer'),
        props: {
          clipboardTextSerializer: () => {
            const { editor } = this
            const { from, to } = editor.state.selection

            return textBetween(editor, from, to, '\n')
          },
        },
      }),
    ]
  },
})
