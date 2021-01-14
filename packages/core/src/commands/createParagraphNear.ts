import { createParagraphNear as originalCreateParagraphNear } from 'prosemirror-commands'
import { Command } from '../types'

/**
 * Create a paragraph nearby.
 */
export const createParagraphNear = (): Command => ({ state, dispatch }) => {
  return originalCreateParagraphNear(state, dispatch)
}
