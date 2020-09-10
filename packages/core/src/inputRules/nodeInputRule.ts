import { InputRule } from 'prosemirror-inputrules'
import { NodeType } from 'prosemirror-model'

export default function (regexp: RegExp, type: NodeType, getAttrs?: Function) {
  return new InputRule(regexp, (state, match, start, end) => {
    const attrs = getAttrs instanceof Function ? getAttrs(match) : getAttrs
    const { tr } = state

    if (match[0]) {
      tr.replaceWith(start - 1, end, type.create(attrs))
    }

    return tr
  })
}