import type { CommandProps, CommandSpec } from '../types.js'

declare module '@dibdab/core' {
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
            index: number
          },
        ) => boolean,
      ) => ReturnType
    }
  }
}

export const forEach: CommandSpec = (items, fn) => props => {
  return items.every((item, index) => fn(item, { ...props, index }))
}
