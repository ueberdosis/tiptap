import { InputRule, InputRuleFinder, ExtendedRegExpMatchArray } from '../InputRule'
import { NodeType, Node as ProseMirrorNode } from 'prosemirror-model'
import { findWrapping, canJoin } from 'prosemirror-transform'
import callOrReturn from '../utilities/callOrReturn'

export default function wrappingInputRule(config: {
  find: InputRuleFinder,
  type: NodeType,
  getAttributes?:
    | Record<string, any>
    | ((match: ExtendedRegExpMatchArray) => Record<string, any>)
    | false
    | null
  ,
  joinPredicate?: (match: ExtendedRegExpMatchArray, node: ProseMirrorNode) => boolean,
}) {
  return new InputRule({
    find: config.find,
    handler: ({ state, range, match }) => {
      const attributes = callOrReturn(config.getAttributes, undefined, match) || {}
      const tr = state.tr.delete(range.from, range.to)
      const $start = tr.doc.resolve(range.from)
      const blockRange = $start.blockRange()
      const wrapping = blockRange && findWrapping(blockRange, config.type, attributes)

      if (!wrapping) {
        return null
      }

      tr.wrap(blockRange, wrapping)

      const before = tr.doc.resolve(range.from - 1).nodeBefore

      if (
        before
        && before.type === config.type
        && canJoin(tr.doc, range.from - 1)
        && (!config.joinPredicate || config.joinPredicate(match, before))
      ) {
        tr.join(range.from - 1)
      }
    },
  })
}
