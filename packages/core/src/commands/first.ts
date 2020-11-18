import { Command } from '../types'

/**
 * Runs one command after the other and stops at the first which returns true.
 */
export const first = (commands: Command[] | ((props: Parameters<Command>[0]) => Command[])): Command => props => {
  const items = typeof commands === 'function'
    ? commands(props)
    : commands

  for (let i = 0; i < items.length; i += 1) {
    if (items[i](props)) {
      return true
    }
  }

  return false
}
