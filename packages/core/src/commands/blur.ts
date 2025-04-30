import type { RawCommands } from '../types.js'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    blur: {
      /**
       * Removes focus from the editor.
       * @example editor.commands.blur()
       */
      blur: () => ReturnType
    }
  }
}

export const blur: RawCommands['blur'] =
  () =>
  ({ editor, view }) => {
    requestAnimationFrame(() => {
      if (!editor.isDestroyed) {
        ;(view.dom as HTMLElement).blur()

        // Browsers should remove the caret on blur but safari does not.
        // See: https://github.com/ueberdosis/tiptap/issues/2405
        window?.getSelection()?.removeAllRanges()
      }
    })

    return true
  }
