import {
  joinBackward as originalJoinBackward,
  joinDown as originalJoinDown,
  joinForward as originalJoinForward,
  joinUp as originalJoinUp,
} from '@tiptap/pm/commands'

import { RawCommands } from '../types.js'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    joinUp: {
      /**
       * Join the selected block or, if there is a text selection, the closest ancestor block of the selection that can be joined, with the sibling above it.
       * @example editor.commands.joinUp()
       */
      joinUp: () => ReturnType
    }
    joinDown: {
      /**
       * Join the selected block, or the closest ancestor of the selection that can be joined, with the sibling after it.
       * @example editor.commands.joinDown()
       */
      joinDown: () => ReturnType
    }
    joinBackward: {
      /**
       * If the selection is empty and at the start of a textblock, try to reduce the distance between that block and the one before it—if there's a block directly before it that can be joined, join them.
       * If not, try to move the selected block closer to the next one in the document structure by lifting it out of its
       * parent or moving it into a parent of the previous block. Will use the view for accurate (bidi-aware) start-of-textblock detection if given.
       * @example editor.commands.joinBackward()
       */
      joinBackward: () => ReturnType
    }
    joinForward: {
      /**
       * If the selection is empty and the cursor is at the end of a textblock, try to reduce or remove the boundary between that block and the one after it,
       * either by joining them or by moving the other block closer to this one in the tree structure.
       * Will use the view for accurate start-of-textblock detection if given.
       * @example editor.commands.joinForward()
       */
      joinForward: () => ReturnType
    }
  }
}

export const joinUp: RawCommands['joinUp'] = () => ({ state, dispatch }) => {
  return originalJoinUp(state, dispatch)
}

export const joinDown: RawCommands['joinDown'] = () => ({ state, dispatch }) => {
  return originalJoinDown(state, dispatch)
}

export const joinBackward: RawCommands['joinBackward'] = () => ({ state, dispatch }) => {
  return originalJoinBackward(state, dispatch)
}

export const joinForward: RawCommands['joinForward'] = () => ({ state, dispatch }) => {
  return originalJoinForward(state, dispatch)
}
