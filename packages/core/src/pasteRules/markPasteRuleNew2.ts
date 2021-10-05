import { PasteRule } from '../PasteRule'
import { MarkType } from 'prosemirror-model'
import getMarksBetween from '../helpers/getMarksBetween'

type MarkPasteRuleMatch = {
  index: number,
  text: string,
  replaceWith?: string,
  match?: RegExpMatchArray,
  [key: string]: any,
}

export default function markPasteRule(config: {
  matcher: RegExp | ((text: string) => MarkPasteRuleMatch[]),
  type: MarkType,
  getAttributes?:
    | Record<string, any>
    | ((match: MarkPasteRuleMatch) => Record<string, any>)
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
    // return fragment
    const attributes = config.getAttributes instanceof Function
      ? config.getAttributes(match)
      : config.getAttributes
    const { tr } = state
    const captureGroup = match[match.length - 1]
    const fullMatch = match[0]
    let markEnd = end

    console.log({
      captureGroup, fullMatch, start, end,
    })

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
        console.log('delete 1')
        tr.delete(textEnd, end)
      }

      if (textStart > start) {
        console.log('delete 2')
        tr.delete(start + startSpaces, textStart)
      }

      markEnd = start + startSpaces + captureGroup.length

      console.log('addmark')

      tr.addMark(start + startSpaces, markEnd, config.type.create(attributes))

      tr.removeStoredMark(config.type)
    }

    // return tr
  })
}
