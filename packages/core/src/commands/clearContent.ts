import { Command } from '../Editor'

type ClearContentCommand = (emitUpdate?: Boolean) => Command

declare module '../Editor' {
  interface Editor {
    clearContent: ClearContentCommand,
  }
}

export const clearContent: ClearContentCommand = (emitUpdate = false) => ({ editor }) => {
  // TODO: doesn’t work, we have to re-use `tr`
  editor.setContent('', emitUpdate)

  return true
}
