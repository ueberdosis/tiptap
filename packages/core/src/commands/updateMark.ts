import { Command } from '../Editor'
import { MarkType } from 'prosemirror-model'
import getMarkType from '../utils/getMarkType'
import getMarkRange from '../utils/getMarkRange'

type UpdateMarkCommand = (
  typeOrName: string | MarkType,
  attrs: {},
) => Command

declare module '../Editor' {
  interface Commands {
    updateMark: UpdateMarkCommand,
  }
}

export const updateMark: UpdateMarkCommand = (typeOrName, attrs = {}) => ({ tr, state }) => {
  const { selection, doc } = tr
  let { from, to, $from, empty } = selection
  const type = getMarkType(typeOrName, state.schema)

  if (empty) {
    const range = getMarkRange($from, type)

    if (range) {
      from = range.from
      to = range.to
    }
  }

  const hasMark = doc.rangeHasMark(from, to, type)

  if (hasMark) {
    tr.removeMark(from, to, type)
  }

  tr.addMark(from, to, type.create(attrs))

  return true
}
