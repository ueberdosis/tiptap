import { Selection, TextSelection } from '@tiptap/pm/state'

import type { RawCommands } from '../types.js'

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
      cut: ({ from, to }: { from: number; to: number }, targetPos: number) => ReturnType
    }
  }
}

export const cut: RawCommands['cut'] =
  (originRange, targetPos) =>
  ({ editor, tr }) => {
    const { state } = editor

    const contentSlice = state.doc.slice(originRange.from, originRange.to)

    tr.deleteRange(originRange.from, originRange.to)
    const newPos = tr.mapping.map(targetPos)

    tr.insert(newPos, contentSlice.content)

    // Position 0 is outside any textblock, so pick the closest valid text position.
    // Search for text first: `near` alone would select a leaf node such as a horizontal rule.
    const $pos = tr.doc.resolve(Math.max(newPos - 1, 0))
    const selection =
      Selection.findFrom($pos, 1, true) ??
      Selection.findFrom($pos, -1, true) ??
      TextSelection.near($pos)

    tr.setSelection(selection)

    return true
  }
