import type { MarkType } from '@tiptap/pm/model'

import { getMarkType } from '../helpers/getMarkType.js'
import { isMarkActive } from '../helpers/isMarkActive.js'
import type { RawCommands } from '../types.js'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    toggleMark: {
      /**
       * Toggle a mark on and off.
       * @param typeOrName The mark type or name.
       * @param attributes The attributes of the mark.
       * @param options.extendEmptyMarkRange With an empty selection, act on the whole mark around the cursor. Defaults to `false`.
       * @example editor.commands.toggleMark('bold')
       */
      toggleMark: (
        typeOrName: string | MarkType,
        attributes?: Record<string, any>,
        options?: {
          extendEmptyMarkRange?: boolean
        },
      ) => ReturnType
    }
  }
}

export const toggleMark: RawCommands['toggleMark'] =
  (typeOrName, attributes = {}, options = {}) =>
  ({ state, commands }) => {
    const { extendEmptyMarkRange = false } = options
    const type = getMarkType(typeOrName, state.schema)
    const isActive = isMarkActive(state, type, attributes)

    if (isActive) {
      return commands.unsetMark(type, { extendEmptyMarkRange })
    }

    return commands.setMark(type, attributes)
  }
