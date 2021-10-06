import { PasteRule, PasteRuleMatcher, ExtendedRegExpMatchArray } from '../PasteRule'
import { MarkType } from 'prosemirror-model'
import getMarksBetween from '../helpers/getMarksBetween'

export default function markPasteRule(config: {
  matcher: PasteRuleMatcher,
  type: MarkType,
  getAttributes?:
    | Record<string, any>
    | ((match: ExtendedRegExpMatchArray) => Record<string, any>)
    | false
    | null
  ,
}) {
  return new PasteRule(config.matcher, ({
    state,
    match,
    start,
    end,
  }) => {
    const attributes = config.getAttributes instanceof Function
      ? config.getAttributes(match)
      : config.getAttributes

    if (attributes === false || attributes === null) {
      return
    }

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
          return excluded.find((type: MarkType) => type.name === config.type.name)
        })
        .filter(item => item.to > textStart)

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

      tr.addMark(start + startSpaces, markEnd, config.type.create(attributes || {}))

      tr.removeStoredMark(config.type)
    }
  })
}
