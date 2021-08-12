import { RawCommands } from '../types'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    blur: {
      /**
       * Removes focus from the editor.
       */
      blur: () => ReturnType,
    }
  }
}

export const blur: RawCommands['blur'] = () => ({ editor, view }) => {
  requestAnimationFrame(() => {
    if (!editor.isDestroyed) {
      (view.dom as HTMLElement).blur()
    }
  })

  return true
}
