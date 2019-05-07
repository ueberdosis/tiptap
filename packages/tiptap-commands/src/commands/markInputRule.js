import { InputRule } from 'prosemirror-inputrules'

export default function (regexp, markType, getAttrs) {
  return new InputRule(regexp, (state, match, start, end) => {
    const attrs = getAttrs instanceof Function ? getAttrs(match) : getAttrs
    const { tr } = state
    const m = match.length - 1
    let markEnd = end
    let markStart = start

    if (match[m]) {
      const matchStart = start + match[0].indexOf(match[m - 1])
      // matchEnd index is -1 because the last matching char is not yet member of transaction
      //   and actually never will be because it triggered the inputrule and vanishes ;)
      const matchEnd = matchStart + match[m - 1].length - 1
      const textStart = matchStart + match[m - 1].lastIndexOf(match[m])
      const textEnd = textStart + match[m].length

      if (textEnd < matchEnd) {
        tr.delete(textEnd, matchEnd)
      }
      if (textStart > matchStart) {
        tr.delete(matchStart, textStart)
      }
      markStart = matchStart
      markEnd = markStart + match[m].length
    }

    tr.addMark(markStart, markEnd, markType.create(attrs))
    tr.removeStoredMark(markType) // Do not continue with mark.
    return tr
  })
}
