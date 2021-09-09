import { Range, TextSerializer } from '../types'
import { Node as ProseMirrorNode } from 'prosemirror-model'

export default function getTextBetween(
  startNode: ProseMirrorNode,
  range: Range,
  options?: {
    blockSeparator?: string,
    leafText?: string,
    textSerializers?: Record<string, TextSerializer>,
  },
): string {
  const { from, to } = range
  const {
    blockSeparator = '\n\n',
    leafText = undefined,
    textSerializers = {},
  } = options || {}
  let text = ''
  let separated = true

  startNode.nodesBetween(from, to, (node, pos) => {
    const textSerializer = textSerializers?.[node.type.name]

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
