import type { RawCommands } from '../types.js'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    unsetAllMarks: {
      /**
       * Remove all clearable marks in the current selection.
       * Marks with `clearable: false` are preserved
       * @example editor.commands.unsetAllMarks()
       */
      unsetAllMarks: () => ReturnType
    }
  }
}

export const unsetAllMarks: RawCommands['unsetAllMarks'] =
  () =>
  ({ tr, dispatch, editor }) => {
    const { selection } = tr
    const { empty, ranges } = selection

    if (empty) {
      return true
    }

    const { nonClearableMarks } = editor.extensionManager

    if (dispatch) {
      const clearableMarkTypes = Object.values(editor.schema.marks).filter(
        markType => !nonClearableMarks.includes(markType.name),
      )

      ranges.forEach(range => {
        for (const markType of clearableMarkTypes) {
          tr.removeMark(range.$from.pos, range.$to.pos, markType)
        }
      })
    }

    return true
  }
