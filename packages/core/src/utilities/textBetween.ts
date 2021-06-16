import { Editor } from '@tiptap/core'

export default function textBetween(
  editor: Editor,
  from: number,
  to: number,
  blockSeparator?: string,
  leafText?: string,
): string {
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
