import { toggleMark as originalToggleMark } from 'prosemirror-commands'
import { MarkType } from 'prosemirror-model'
import { Command } from '../Editor'
import { createExtension } from '../Extension'
import getMarkType from '../utils/getMarkType'
import markIsActive from '../utils/markIsActive'

export const ToggleMark = createExtension({
  addCommands() {
    return {
      toggleMark: (typeOrName: string | MarkType): Command => ({ state, dispatch }) => {
        const type = getMarkType(typeOrName, state.schema)

        /* TODO:
        const hasMarkWithDifferentAttributes = attrs
          && markIsActive(state, type)
          && !markIsActive(state, type, attrs)

        if (hasMarkWithDifferentAttributes) {
          // @ts-ignore
          return commands.updateMark(type, attrs)
        }
        */

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
