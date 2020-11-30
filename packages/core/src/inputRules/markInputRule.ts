import { InputRule } from 'prosemirror-inputrules'
import { EditorState } from 'prosemirror-state'
import { MarkType } from 'prosemirror-model'

function getMarksBetween(start: number, end: number, state: EditorState) {
  let marks: any[] = []

  state.doc.nodesBetween(start, end, (node, pos) => {
    marks = [...marks, ...node.marks.map(mark => ({
      start: pos,
      end: pos + node.nodeSize,
      mark,
    }))]
  })

  return marks
}

export default function (regexp: RegExp, markType: MarkType, getAttributes?: Function) {
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
