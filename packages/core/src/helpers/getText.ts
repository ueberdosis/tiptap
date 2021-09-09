import { TextSerializer } from '../types'
import { Node as ProseMirrorNode } from 'prosemirror-model'
import getTextBetween from './getTextBetween'

export default function getText(
  node: ProseMirrorNode,
  options?: {
    blockSeparator?: string,
    textSerializers?: Record<string, TextSerializer>,
  },
) {
  const range = {
    from: 0,
    to: node.content.size,
  }

  return getTextBetween(node, range, options)
}
