import type { Node as ProseMirrorNode } from '@tiptap/pm/model'
import type { SelectionRange } from '@tiptap/pm/state'

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

function selectionHasClearableMarks(
  doc: ProseMirrorNode,
  ranges: readonly SelectionRange[],
  nonClearableMarks: string[],
): boolean {
  return ranges.some(({ $from, $to }) => {
    let hasClearableMarks = false

    doc.nodesBetween($from.pos, $to.pos, node => {
      if (node.marks.some(mark => !nonClearableMarks.includes(mark.type.name))) {
        hasClearableMarks = true
      }
    })

    return hasClearableMarks
  })
}

export const unsetAllMarks: RawCommands['unsetAllMarks'] =
  () =>
  ({ tr, dispatch, editor, state }) => {
    const { selection } = tr
    const { empty, ranges } = selection

    if (empty) {
      return true
    }

    const { nonClearableMarks } = editor.extensionManager

    if (!selectionHasClearableMarks(state.doc, ranges, nonClearableMarks)) {
      return false
    }

    if (dispatch) {
      const clearableMarkTypes = Object.values(state.schema.marks).filter(
        markType => !nonClearableMarks.includes(markType.name),
      )

      ranges.forEach(range => {
        clearableMarkTypes.forEach(markType => {
          tr.removeMark(range.$from.pos, range.$to.pos, markType)
        })
      })
    }

    return true
  }
