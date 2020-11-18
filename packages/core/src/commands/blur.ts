import { Command } from '../types'

/**
 * Removes focus from the editor.
 */
export const blur = (): Command => ({ view }) => {
  const element = view.dom as HTMLElement

  element.blur()

  return true
}
