import { toggleMark as originalToggleMark } from 'prosemirror-commands'
import { MarkType } from 'prosemirror-model'
import { Command } from '../Editor'
import { createExtension } from '../Extension'
import getMarkType from '../utils/getMarkType'

export const ToggleMark = createExtension({
  addCommands() {
    return {
      toggleMark: (typeOrName: string | MarkType): Command => ({ state, dispatch }) => {
        const type = getMarkType(typeOrName, state.schema)

        return originalToggleMark(type)(state, dispatch)
      },
    }
  },
})

declare module '../Editor' {
  interface AllExtensions {
    ToggleMark: typeof ToggleMark,
  }
}
