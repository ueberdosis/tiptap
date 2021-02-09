import { Command } from '../types'

/**
 * Trigger enter.
 */
export const enter = (): Command => ({ commands }) => {
  return commands.keyboardShortcut('Enter')
}
