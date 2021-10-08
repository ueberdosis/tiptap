import { InputRule, InputRuleFinder } from '../InputRule'
import { MarkType } from 'prosemirror-model'
import getMarksBetween from '../helpers/getMarksBetween'
import callOrReturn from '../utilities/callOrReturn'
import { ExtendedRegExpMatchArray } from '../types'

/**
 * Build an input rule that adds a mark when the
 * matched text is typed into it.
 */
export default function markInputRule(config: {
  find: InputRuleFinder,
  type: MarkType,
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
      const attributes = callOrReturn(config.getAttributes, undefined, match)

      if (attributes === false || attributes === null) {
        return
      }

      const { tr } = state
      const captureGroup = match[match.length - 1]
      const fullMatch = match[0]
      let markEnd = range.to

      if (captureGroup) {
        const startSpaces = fullMatch.search(/\S/)
        const textStart = range.from + fullMatch.indexOf(captureGroup)
        const textEnd = textStart + captureGroup.length

        const excludedMarks = getMarksBetween(range.from, range.to, state)
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

        if (textEnd < range.to) {
          tr.delete(textEnd, range.to)
        }

        if (textStart > range.from) {
          tr.delete(range.from + startSpaces, textStart)
        }

        markEnd = range.from + startSpaces + captureGroup.length

        tr.addMark(range.from + startSpaces, markEnd, config.type.create(attributes || {}))

        tr.removeStoredMark(config.type)
      }
    },
  })
}
