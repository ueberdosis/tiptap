import { PasteRule, PasteRuleMatcher } from '../PasteRule'

export default function textPasteRule(config: {
  matcher: PasteRuleMatcher,
  text: string,
}) {
  return new PasteRule({
    matcher: config.matcher,
    handler: ({ state, range, match }) => {
      let insert = config.text
      let start = range.from
      const end = range.to

      if (match[1]) {
        const offset = match[0].lastIndexOf(match[1])

        insert += match[0].slice(offset + match[1].length)
        start += offset

        const cutOff = start - end

        if (cutOff > 0) {
          insert = match[0].slice(offset - cutOff, offset) + insert
          start = end
        }
      }

      state.tr.insertText(insert, start, end)
    },
  })
}
