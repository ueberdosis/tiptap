import { Command } from '../types'

export default (fn: (props: Parameters<Command>[0]) => boolean): Command => props => {
  return fn(props)
}
