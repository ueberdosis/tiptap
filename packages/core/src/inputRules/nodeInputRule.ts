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
      tr.replaceWith(matchStart, end, type.create(attributes))
    } else if (match[0]) {
      tr.replaceWith(start, end, type.create(attributes))
    }

    return tr
  })
}
