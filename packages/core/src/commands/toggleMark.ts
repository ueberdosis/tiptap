import { Command } from '../Editor'
import { toggleMark as originalToggleMark } from 'prosemirror-commands'
import { MarkType } from 'prosemirror-model'
import getMarkType from '../utils/getMarkType'

type ToggleMarkCommand = (typeOrName: string | MarkType) => Command

declare module '../Editor' {
  interface Commands {
    toggleMark: ToggleMarkCommand,
  }
}

export const toggleMark: ToggleMarkCommand = (typeOrName) => ({ state, dispatch }) => {
  const type = getMarkType(typeOrName, state.schema)

  return originalToggleMark(type)(state, dispatch)
}
