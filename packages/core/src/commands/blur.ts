import { Command, Commands } from '../types'

/**
 * Removes focus from the editor.
 */
export const blur: Commands['blur'] = () => ({ view }) => {
  const element = view.dom as HTMLElement

  element.blur()

  return true
}

declare module '@tiptap/core' {
  interface Commands {
    blur: () => Command,
  }
}
