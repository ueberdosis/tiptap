import type { MarkType } from '@dibdab/pm/model'

import { getMarkType } from '../helpers/getMarkType.js'
import { isMarkActive } from '../helpers/isMarkActive.js'
import type { CommandSpec } from '../types.js'

declare module '@dibdab/core' {
  interface Commands<ReturnType> {
    toggleMark: {
      /**
       * Toggle a mark on and off.
       * @param typeOrName The mark type or name.
       * @param attributes The attributes of the mark.
       * @param options.extendEmptyMarkRange Removes the mark even across the current selection. Defaults to `false`.
       * @example editor.commands.toggleMark('bold')
       */
      toggleMark: (
        /**
         * The mark type or name.
         */
        typeOrName: string | MarkType,

        /**
         * The attributes of the mark.
         */
        attributes?: Record<string, any>,

        options?: {
          /**
           * Removes the mark even across the current selection. Defaults to `false`.
           */
          extendEmptyMarkRange?: boolean
        },
      ) => ReturnType
    }
  }
}

export const toggleMark: CommandSpec =
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
