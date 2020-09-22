import { Command } from '../Editor'
import { selectAll as originalSelectAll } from 'prosemirror-commands'

type SelectAllCommand = () => Command

declare module '../Editor' {
  interface Commands {
    selectAll: SelectAllCommand,
  }
}

export const selectAll: SelectAllCommand = () => ({ state, dispatch }) => {
  return originalSelectAll(state, dispatch)
}
