import { TextSelection } from '@tiptap/pm/state'

import { RawCommands } from '../types.js'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    cut: {
      /**
       * Cuts content from a range and inserts it at a given position.
       */
      cut: ({ from, to }: { from: number, to: number }, targetPos: number) => ReturnType,
    }
  }
}

export const cut: RawCommands['cut'] = (originRange, targetPos) => ({ editor, tr }) => {
  const { state } = editor

  const contentSlice = state.doc.slice(originRange.from, originRange.to)

  tr.deleteRange(originRange.from, originRange.to)
  const newPos = tr.mapping.map(targetPos)

  tr.insert(newPos, contentSlice.content)

  tr.setSelection(new TextSelection(tr.doc.resolve(newPos - 1)))

  return true
}
