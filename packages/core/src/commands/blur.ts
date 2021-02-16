import { Command, Commands } from '../types'

declare module '@tiptap/core' {
  interface AllCommands {
    blur: {
      /**
       * Removes focus from the editor.
       */
      blur: () => Command,
    }
  }
}

export const blur: Commands['blur'] = () => ({ view }) => {
  const element = view.dom as HTMLElement

  element.blur()

  return true
}
