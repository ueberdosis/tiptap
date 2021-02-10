import { createParagraphNear as originalCreateParagraphNear } from 'prosemirror-commands'
import { Command, Commands } from '../types'

/**
 * Create a paragraph nearby.
 */
export const createParagraphNear: Commands['createParagraphNear'] = () => ({ state, dispatch }) => {
  return originalCreateParagraphNear(state, dispatch)
}

declare module '@tiptap/core' {
  interface Commands {
    createParagraphNear: () => Command,
  }
}
