import { TextSelection } from '@tiptap/pm/state'

import { RawCommands } from '../types.js'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    cut: {
      /**
       * Cuts content from a range and inserts it at a given position.
       * @param range The range to cut.
       * @param range.from The start position of the range.
       * @param range.to The end position of the range.
       * @param targetPos The position to insert the content at.
       * @example editor.commands.cut({ from: 1, to: 3 }, 5)
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
