import type { CommandSpec } from '../types.js'

declare module '@dibdab/core' {
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

// @ts-ignore - Type is correctly defined via module augmentation
export const blur: CommandSpec =
  () =>
  // @ts-ignore - Parameters are correctly typed via RawCommands
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
