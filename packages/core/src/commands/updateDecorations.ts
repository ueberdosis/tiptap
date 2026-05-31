import { decorationManagerKey } from '../features/decorations/index.js'
import type { RawCommands } from '../types.js'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    updateDecorations: {
      /**
       * Force declarative decorations to recompute, bypassing each extension's
       * `shouldUpdate` gate. Pass an extension name to recompute only that
       * extension's decorations, or omit it to recompute all of them.
       * @param extensionName The name of the extension to recompute (optional).
       * @example editor.commands.updateDecorations()
       * @example editor.commands.updateDecorations('myExtension')
       */
      updateDecorations: (extensionName?: string) => ReturnType
    }
  }
}

export const updateDecorations: RawCommands['updateDecorations'] =
  extensionName =>
  ({ tr, dispatch }) => {
    if (dispatch) {
      tr.setMeta(decorationManagerKey, { type: 'force', name: extensionName })
    }

    return true
  }
