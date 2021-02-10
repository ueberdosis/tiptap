import { createParagraphNear as originalCreateParagraphNear } from 'prosemirror-commands'
import { Command, Commands } from '../types'

declare module '@tiptap/core' {
  interface Commands {
    /**
     * Create a paragraph nearby.
     */
    createParagraphNear: () => Command,
  }
}

export const createParagraphNear: Commands['createParagraphNear'] = () => ({ state, dispatch }) => {
  return originalCreateParagraphNear(state, dispatch)
}
