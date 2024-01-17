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
       * Join two nodes Up.
       */
      joinUp: () => ReturnType
    }
    joinDown: {
      /**
       * Join two nodes Down.
       */
      joinDown: () => ReturnType
    }
    joinBackward: {
      /**
       * Join two nodes Backwards.
       */
      joinBackward: () => ReturnType
    }
    joinForward: {
      /**
       * Join two nodes Forwards.
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
