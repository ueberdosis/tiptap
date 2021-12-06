import { MarkType } from 'prosemirror-model'
import { RawCommands } from '../types'
import { getMarkType } from '../helpers/getMarkType'
import { isMarkActive } from '../helpers/isMarkActive'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    toggleMark: {
      /**
       * Toggle a mark on and off.
       */
      toggleMark: (
        typeOrName: string | MarkType,
        attributes?: Record<string, any>,
        options?: {
          /**
           * Removes the mark even across the current selection. Defaults to `false`.
           */
          extendEmptyMarkRange?: boolean,
        },
      ) => ReturnType,
    }
  }
}

export const toggleMark: RawCommands['toggleMark'] = (typeOrName, attributes = {}, options = {}) => ({ state, commands }) => {
  const { extendEmptyMarkRange = false } = options
  const type = getMarkType(typeOrName, state.schema)
  const isActive = isMarkActive(state, type, attributes)

  if (isActive) {
    return commands.unsetMark(type, { extendEmptyMarkRange })
  }

  return commands.setMark(type, attributes)
}
