import { toggleMark as originalToggleMark } from 'prosemirror-commands'
import { MarkType } from 'prosemirror-model'
import { Command } from '../Editor'
import getMarkType from '../utils/getMarkType'

type ToggleMarkCommand = (typeOrName: string | MarkType, attrs?: {}) => Command

declare module '../Editor' {
  interface Commands {
    toggleMark: ToggleMarkCommand,
  }
}

export const toggleMark: ToggleMarkCommand = (typeOrName, attrs) => ({ state, dispatch }) => {
  const type = getMarkType(typeOrName, state.schema)

  return originalToggleMark(type, attrs)(state, dispatch)
}
