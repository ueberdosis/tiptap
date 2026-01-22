import type { Plugin, PluginKey } from '@dibdab/pm/state'

import type { CommandSpec } from '../types.js'

declare module '@dibdab/core' {
  interface Commands<ReturnType> {
    setMeta: {
      /**
       * Store a metadata property in the current transaction.
       * @param key The key of the metadata property.
       * @param value The value to store.
       * @example editor.commands.setMeta('foo', 'bar')
       */
      setMeta: (key: string | Plugin | PluginKey, value: any) => ReturnType
    }
  }
}

export const setMeta: CommandSpec =
  (key, value) =>
  ({ tr }) => {
    tr.setMeta(key, value)

    return true
  }
