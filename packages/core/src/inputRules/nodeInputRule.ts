import { InputRule } from 'prosemirror-inputrules'
import { NodeType } from 'prosemirror-model'

export default function (regexp: RegExp, type: NodeType, getAttributes?: (match: any) => any): InputRule {
  return new InputRule(regexp, (state, match, start, end) => {
    const attributes = getAttributes instanceof Function
      ? getAttributes(match)
      : getAttributes
    const { tr } = state

    if (match[0]) {
      tr.replaceWith(start - 1, end, type.create(attributes))
    }

    return tr
  })
}
