import { RawCommands } from '../types.js'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    setMeta: {
      /**
       * Store a metadata property in the current transaction.
       * @param key The key of the metadata property.
       * @param value The value to store.
       * @example editor.commands.setMeta('foo', 'bar')
       */
      setMeta: (key: string, value: any) => ReturnType,
    }
  }
}

export const setMeta: RawCommands['setMeta'] = (key, value) => ({ tr }) => {
  tr.setMeta(key, value)

  return true
}
