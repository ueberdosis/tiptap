import { NodeType } from 'prosemirror-model'
import { InputRule, InputRuleFinder } from '../InputRule'
import { ExtendedRegExpMatchArray } from '../types'
import callOrReturn from '../utilities/callOrReturn'

/**
 * Build an input rule that adds a node when the
 * matched text is typed into it.
 */
export default function nodeInputRule(config: {
  find: InputRuleFinder,
  type: NodeType,
  getAttributes?:
    | Record<string, any>
    | ((match: ExtendedRegExpMatchArray) => Record<string, any>)
    | false
    | null
  ,
}) {
  return new InputRule({
    find: config.find,
    handler: ({ state, range, match }) => {
      const attributes = callOrReturn(config.getAttributes, undefined, match) || {}
      const { tr } = state
      const start = range.from
      let end = range.to

      if (match[0]) {
        tr.replaceWith(start, end, config.type.create(attributes))
      }
    },
  })
}
