import { CommandProps, RawCommands } from '../types.js'

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
          props: CommandProps & {
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
