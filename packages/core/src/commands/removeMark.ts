import { MarkType } from 'prosemirror-model'
import { Command } from '../Editor'
import getMarkType from '../utils/getMarkType'
import getMarkRange from '../utils/getMarkRange'

type RemoveMarkCommand = (typeOrName: string | MarkType) => Command

declare module '../Editor' {
  interface Commands {
    toggleMark: RemoveMarkCommand,
  }
}

export const removeMark: RemoveMarkCommand = typeOrName => ({ tr, state }) => {
  const { selection } = tr
  const type = getMarkType(typeOrName, state.schema)
  let { from, to } = selection
  const { $from, empty } = selection

  if (empty) {
    const range = getMarkRange($from, type)

    if (range) {
      from = range.from
      to = range.to
    }
  }

  tr.removeMark(from, to, type)

  return true
}
