import { Node as ProseMirrorNode } from '@tiptap/pm/model'

import { Range, TextSerializer } from '../types.js'

export function getTextBetween(
  startNode: ProseMirrorNode,
  range: Range,
  options?: {
    blockSeparator?: string
    textSerializers?: Record<string, TextSerializer>
  },
): string {
  const { from, to } = range
  const { blockSeparator = '\n\n', textSerializers = {} } = options || {}
  let text = ''
  let separated = true

  startNode.nodesBetween(from, to, (node, pos, parent, index) => {
    const textSerializer = textSerializers?.[node.type.name]

    if (textSerializer) {
      if (node.isBlock && !separated) {
        text += blockSeparator
        separated = true
      }

      if (parent) {
        text += textSerializer({
          node,
          pos,
          parent,
          index,
          range,
        })
      }
    } else if (node.isText) {
      text += node?.text?.slice(Math.max(from, pos) - pos, to - pos) // eslint-disable-line
      separated = false
    } else if (node.isBlock && !separated) {
      text += blockSeparator
      separated = true
    }
  })

  return text
}
