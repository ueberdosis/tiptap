import { Node as ProseMirrorNode } from '@tiptap/pm/model'

import { Range, TextSerializer } from '../types.js'

/**
 * Gets the text between two positions in a Prosemirror node
 * and serializes it using the given text serializers and block separator (see getText)
 * @param startNode The Prosemirror node to start from
 * @param range The range of the text to get
 * @param options Options for the text serializer & block separator
 * @returns The text between the two positions
 */
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

  startNode.nodesBetween(from, to, (node, pos, parent, index) => {
    if (node.isBlock && pos > from) {
      text += blockSeparator
    }

    const textSerializer = textSerializers?.[node.type.name]

    if (textSerializer) {
      if (parent) {
        text += textSerializer({
          node,
          pos,
          parent,
          index,
          range,
        })
      }
      // do not descend into child nodes when there exists a serializer
      return false
    }

    if (node.isText) {
      text += node?.text?.slice(Math.max(from, pos) - pos, to - pos) // eslint-disable-line
    }
  })

  return text
}
