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

export const cut: RawCommands['cut'] = (originRange, targetPos) => ({ editor }) => {
  const { state } = editor

  const contentSlice = state.doc.slice(originRange.from, originRange.to)

  return editor
    .chain()
    .deleteRange(originRange)
    .insertContentAt(targetPos, contentSlice.content.toJSON())
    .focus()
    .run()
}
