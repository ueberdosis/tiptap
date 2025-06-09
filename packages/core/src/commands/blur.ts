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
    const requestAnimationFrameFn = editor.browserEnv.requestAnimationFrame || ((fn: () => void) => fn())

    requestAnimationFrameFn(() => {
      if (!editor.isDestroyed) {
        ;(view.dom as HTMLElement).blur()

        // Browsers should remove the caret on blur but safari does not.
        // See: https://github.com/ueberdosis/tiptap/issues/2405
        const selection = editor.browserEnv.window?.getSelection?.()
        if (selection && typeof selection.removeAllRanges === 'function') {
          selection.removeAllRanges()
        }
      }
    })

    return true
  }
