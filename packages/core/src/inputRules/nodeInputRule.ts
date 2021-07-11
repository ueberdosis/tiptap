import { InputRule } from 'prosemirror-inputrules'
import { NodeType } from 'prosemirror-model'

export default function (regexp: RegExp, type: NodeType, getAttributes?: (match: any) => any): InputRule {
  return new InputRule(regexp, (state, match, start, end) => {
    const attributes = getAttributes instanceof Function
      ? getAttributes(match)
      : getAttributes
    const { tr } = state

    if (match[1]) {
      const offset = match[0].lastIndexOf(match[1])
      start += offset
      if (start > end) {
        start = end;
      }
      else {
        end = start + match[1].length
      }
      tr.replaceWith(start, end, type.create(attributes))
    } else if (match[0]) {
      tr.replaceWith(start, end, type.create(attributes))
    }

    return tr
  })
}
