import { toggleMark as originalToggleMark } from 'prosemirror-commands'
import { MarkType } from 'prosemirror-model'
import { Command } from '../Editor'
import getMarkType from '../utils/getMarkType'
import markIsActive from '../utils/markIsActive'

type ToggleMarkCommand = (typeOrName: string | MarkType, attrs?: {}) => Command

declare module '../Editor' {
  interface Commands {
    toggleMark: ToggleMarkCommand,
  }
}

export const toggleMark: ToggleMarkCommand = (typeOrName, attrs) => ({ state, dispatch, commands }) => {
  const type = getMarkType(typeOrName, state.schema)

  const hasMarkWithDifferentAttributes = attrs
    && markIsActive(state, type)
    && !markIsActive(state, type, attrs)

  if (hasMarkWithDifferentAttributes) {
    // @ts-ignore
    return commands.updateMark(type, attrs)
  }

  return originalToggleMark(type, attrs)(state, dispatch)
}
