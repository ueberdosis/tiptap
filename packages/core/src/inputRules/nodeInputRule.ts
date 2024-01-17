import { NodeType } from '@tiptap/pm/model'

import { InputRule, InputRuleFinder } from '../InputRule.js'
import { ExtendedRegExpMatchArray } from '../types.js'
import { callOrReturn } from '../utilities/callOrReturn.js'

/**
 * Build an input rule that adds a node when the
 * matched text is typed into it.
 */
export function nodeInputRule(config: {
  /**
   * The regex to match.
   */
  find: InputRuleFinder

  /**
   * The node type to add.
   */
  type: NodeType

  /**
   * A function that returns the attributes for the node
   * can also be an object of attributes
   */
  getAttributes?:
    | Record<string, any>
    | ((match: ExtendedRegExpMatchArray) => Record<string, any>)
    | false
    | null
}) {
  return new InputRule({
    find: config.find,
    handler: ({ state, range, match }) => {
      const attributes = callOrReturn(config.getAttributes, undefined, match) || {}
      const { tr } = state
      const start = range.from
      let end = range.to

      const newNode = config.type.create(attributes)

      if (match[1]) {
        const offset = match[0].lastIndexOf(match[1])
        let matchStart = start + offset

        if (matchStart > end) {
          matchStart = end
        } else {
          end = matchStart + match[1].length
        }

        // insert last typed character
        const lastChar = match[0][match[0].length - 1]

        tr.insertText(lastChar, start + match[0].length - 1)

        // insert node from input rule
        tr.replaceWith(matchStart, end, newNode)
      } else if (match[0]) {
        tr.insert(start - 1, config.type.create(attributes)).delete(
          tr.mapping.map(start),
          tr.mapping.map(end),
        )
      }

      tr.scrollIntoView()
    },
  })
}
