import { Command, RawCommands } from '../types'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    forEach: {
      /**
       * Loop through an array of items.
       */
      forEach: <T>(
        items: T[],
        fn: (
          item: T,
          props: Parameters<Command>[0] & {
            index: number,
          },
        ) => boolean,
      ) => ReturnType,
    }
  }
}

export const forEach: RawCommands['forEach'] = (items, fn) => props => {
  return items.every((item, index) => fn(item, { ...props, index }))
}
