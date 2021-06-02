import { Command, RawCommands } from '../types'

declare module '@tiptap/core' {
  interface Commands {
    setMeta: {
      /**
       * Store a metadata property in the current transaction.
       */
      setMeta: (key: string, value: any) => Command,
    }
  }
}

export const setMeta: RawCommands['setMeta'] = (key, value) => ({ tr }) => {
  tr.setMeta(key, value)

  return true
}
