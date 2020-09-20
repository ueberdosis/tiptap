import { Command } from '../Editor'

type ClearContentCommand = (emitUpdate?: Boolean) => Command

declare module '../Editor' {
  interface Editor {
    clearContent: ClearContentCommand,
  }
}

export const clearContent: ClearContentCommand = (emitUpdate = false) => ({ commands }) => {
  return commands.setContent('', emitUpdate)
}
