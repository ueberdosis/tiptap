import { liftEmptyBlock as originalLiftEmptyBlock } from '@tiptap/pm/commands'

import { getActiveSplittableMarks } from '../helpers/getActiveSplittableMarks'
import { RawCommands } from '../types'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    liftEmptyBlock: {
      /**
       * Lift block if empty.
       */
      liftEmptyBlock: () => ReturnType,
    }
  }
}

export const liftEmptyBlock: RawCommands['liftEmptyBlock'] = () => ({
  state, dispatch, editor, chain,
}) => {
  const activeSplittableMarks = getActiveSplittableMarks(state, editor.extensionManager)

  return chain()
    .command(() => originalLiftEmptyBlock(state, dispatch))
    .command(({ tr }) => {
      if (dispatch && activeSplittableMarks.length) {
        tr.ensureMarks(activeSplittableMarks)
      }
      return true
    })
    .run()
}
