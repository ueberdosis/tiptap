import { Command } from '../types'

/**
 * Define a command inline.
 */
export const command = (fn: (props: Parameters<Command>[0]) => boolean): Command => props => {
  return fn(props)
}
