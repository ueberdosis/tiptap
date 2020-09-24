import { selectAll as originalSelectAll } from 'prosemirror-commands'
import { Command } from '../Editor'

type SelectAllCommand = () => Command

declare module '../Editor' {
  interface Commands {
    selectAll: SelectAllCommand,
  }
}

export const selectAll: SelectAllCommand = () => ({ state, dispatch }) => {
  return originalSelectAll(state, dispatch)
}
