import { InputRule } from 'prosemirror-inputrules'
import { MarkType } from 'prosemirror-model'
import getMarksBetween from '../helpers/getMarksBetween'

export default function (regexp: RegExp, markType: MarkType, getAttributes?: Function): InputRule {
  return new InputRule(regexp, (state, match, start, end) => {
    const attributes = getAttributes instanceof Function
      ? getAttributes(match)
      : getAttributes
    const { tr } = state
    const captureGroup = match[match.length - 1]
    const fullMatch = match[0]
    let markEnd = end

    if (captureGroup) {
      const startSpaces = fullMatch.search(/\S/)
      const textStart = start + fullMatch.indexOf(captureGroup)
      const textEnd = textStart + captureGroup.length

      const excludedMarks = getMarksBetween(start, end, state)
        .filter(item => {
          // TODO: PR to add excluded to MarkType
          // @ts-ignore
          const { excluded } = item.mark.type
          return excluded.find((type: MarkType) => type.name === markType.name)
        })
        .filter(item => item.end > textStart)

      if (excludedMarks.length) {
        return null
      }

      if (textEnd < end) {
        tr.delete(textEnd, end)
      }

      if (textStart > start) {
        tr.delete(start + startSpaces, textStart)
      }

      markEnd = start + startSpaces + captureGroup.length

      tr.addMark(start + startSpaces, markEnd, markType.create(attributes))

      tr.removeStoredMark(markType)
    }

    return tr
  })
}
