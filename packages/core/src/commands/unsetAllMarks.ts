import type { RawCommands } from '../types.js'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    unsetAllMarks: {
      /**
       * Remove all clearable marks in the current selection.
       * Marks with `clearable: false` are preserved
       * @param options.ignoreClearable If true, removes all marks regardless of `clearable` setting. Defaults to `false`.
       * @example editor.commands.unsetAllMarks()
       * @example editor.commands.unsetAllMarks({ ignoreClearable: true })
       */
      unsetAllMarks: (options?: { ignoreClearable?: boolean }) => ReturnType
    }
  }
}

export const unsetAllMarks: RawCommands['unsetAllMarks'] =
  (options = {}) =>
  ({ tr, dispatch, editor }) => {
    const { ignoreClearable = false } = options
    const { selection } = tr
    const { empty, ranges } = selection

    if (empty) {
      return true
    }

    const { nonClearableMarks } = editor.extensionManager

    if (dispatch) {
      const clearableMarkTypes = Object.values(editor.schema.marks).filter(
        markType => ignoreClearable || !nonClearableMarks.includes(markType.name),
      )

      ranges.forEach(range => {
        for (const markType of clearableMarkTypes) {
          tr.removeMark(range.$from.pos, range.$to.pos, markType)
        }
      })
    }

    return true
  }
