import type { Node as ProseMirrorNode } from '@tiptap/pm/model'

import type { TextSerializer } from '../types.js'
import { getTextBetween } from './getTextBetween.js'

/**
 * Gets the text of a Prosemirror node
 * @param node The Prosemirror node
 * @param options Options for the text serializer & block separator
 * @returns The text of the node
 * @example ```js
 * const text = getText(node, { blockSeparator: '\n' })
 * ```
 */
export function getText(
  node: ProseMirrorNode,
  options?: {
    blockSeparator?: string
    textSerializers?: Record<string, TextSerializer>
  },
) {
  const range = {
    from: 0,
    to: node.content.size,
  }

  return getTextBetween(node, range, options)
}
