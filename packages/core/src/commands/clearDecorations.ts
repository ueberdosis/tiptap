import { decorationManagerKey } from '../features/decorations/DecorationManager.js'
import type { RawCommands } from '../types.js'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    clearDecorations: {
      /**
       * Clear all declarative decorations until the next recompute. Decorations
       * reappear on the next transaction that recomputes them (e.g. a document
       * change, or a call to `updateDecorations`).
       * @example editor.commands.clearDecorations()
       */
      clearDecorations: () => ReturnType
    }
  }
}

export const clearDecorations: RawCommands['clearDecorations'] =
  () =>
  ({ tr, dispatch }) => {
    if (dispatch) {
      tr.setMeta(decorationManagerKey, { type: 'clear' })
    }

    return true
  }
