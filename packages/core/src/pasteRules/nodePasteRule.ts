import { NodeType } from 'prosemirror-model'

import { PasteRule } from '../PasteRule'
import { ExtendedRegExpMatchArray } from '../types'
import { callOrReturn } from '../utilities'

/**
 * Build an paste rule that adds a node when the
 * matched text is pasted into it.
 */
export function nodePasteRule(config: {
  find: RegExp,
  type: NodeType,
  getAttributes?:
    | Record<string, any>
    | ((match: ExtendedRegExpMatchArray) => Record<string, any>)
    | false
    | null,
}) {
  return new PasteRule({
    find: config.find,
    handler({ match, chain, range }) {
      const attributes = callOrReturn(config.getAttributes, undefined, match)

      if (attributes === false || attributes === null) {
        return null
      }

      if (match.input) {
        chain()
          .deleteRange(range)
          .insertContent({
            type: config.type.name,
            attrs: attributes,
          })
      }
    },
  })
}
