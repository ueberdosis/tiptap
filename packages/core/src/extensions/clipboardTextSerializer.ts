import { Editor } from '@tiptap/core'
import { Plugin, PluginKey } from 'prosemirror-state'
import { Extension } from '../Extension'

const textBetween = (
  editor: Editor,
  from: number,
  to: number,
  blockSeparator?: string,
  leafText?: string,
): string => {
  let text = ''
  let separated = true

  editor.state.doc.nodesBetween(from, to, (node, pos) => {
    const textSerializer = editor.extensionManager.textSerializers[node.type.name]

    if (textSerializer) {
      text += textSerializer({ node })
      separated = !blockSeparator
    } else if (node.isText) {
      text += node?.text?.slice(Math.max(from, pos) - pos, to - pos)
      separated = !blockSeparator
    } else if (node.isLeaf && leafText) {
      text += leafText
      separated = !blockSeparator
    } else if (!separated && node.isBlock) {
      text += blockSeparator
      separated = true
    }
  }, 0)

  return text
}

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

declare module '@tiptap/core' {
  interface AllExtensions {
    ClipboardTextSerializer: typeof ClipboardTextSerializer,
  }
}
