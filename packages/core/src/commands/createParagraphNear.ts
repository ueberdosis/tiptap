import { createParagraphNear as originalCreateParagraphNear } from '@dibdab/pm/commands'

import type { Command, CommandProps } from '../types.js'

declare module '@dibdab/core' {
  interface Commands<ReturnType> {
    createParagraphNear: {
      /**
       * Create a paragraph nearby.
       * @example editor.commands.createParagraphNear()
       */
      createParagraphNear: () => ReturnType
    }
  }
}

export const createParagraphNear =
  (): Command =>
  ({ state, dispatch }: CommandProps) => {
    return originalCreateParagraphNear(state, dispatch)
  }
