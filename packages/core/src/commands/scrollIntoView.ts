import { Command, Commands } from '../types'

/**
 * Scroll the selection into view.
 */
export const scrollIntoView: Commands['scrollIntoView'] = () => ({ tr, dispatch }) => {
  if (dispatch) {
    tr.scrollIntoView()
  }

  return true
}

declare module '@tiptap/core' {
  interface Commands {
    scrollIntoView: () => Command,
  }
}
