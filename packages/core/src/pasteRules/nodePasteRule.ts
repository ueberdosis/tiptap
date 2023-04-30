import { NodeType } from '@tiptap/pm/model'

import { PasteRule, PasteRuleFinder } from '../PasteRule.js'
import { ExtendedRegExpMatchArray } from '../types.js'
import { callOrReturn } from '../utilities/index.js'

/**
 * Build an paste rule that adds a node when the
 * matched text is pasted into it.
 */
export function nodePasteRule(config: {
  find: PasteRuleFinder
  type: NodeType
  getAttributes?:
    | Record<string, any>
    | ((match: ExtendedRegExpMatchArray) => Record<string, any>)
    | false
    | null
}) {
  return new PasteRule({
    find: config.find,
    handler({ match, chain, range }) {
      const attributes = callOrReturn(config.getAttributes, undefined, match)

      if (attributes === false || attributes === null) {
        return null
      }

      if (match.input) {
        chain().deleteRange(range).insertContentAt(range.from, {
          type: config.type.name,
          attrs: attributes,
        })
      }
    },
  })
}
