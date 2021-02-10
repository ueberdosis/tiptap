import { Command, Commands } from '../types'

declare module '@tiptap/core' {
  interface Commands {
    /**
     * Scroll the selection into view.
     */
    scrollIntoView: () => Command,
  }
}

export const scrollIntoView: Commands['scrollIntoView'] = () => ({ tr, dispatch }) => {
  if (dispatch) {
    tr.scrollIntoView()
  }

  return true
}
