import type { EditorState, Transaction } from '@tiptap/pm/state'
import { NodeSelection } from '@tiptap/pm/state'
import { canSplit } from '@tiptap/pm/transform'

import { defaultBlockAt } from '../helpers/defaultBlockAt.js'
import { getSplittedAttributes } from '../helpers/getSplittedAttributes.js'
import { previewDeleteSelection } from '../helpers/previewDeleteSelection.js'
import type { RawCommands } from '../types.js'

function ensureMarks(
  tr: Transaction,
  preSplitState: Pick<EditorState, 'storedMarks' | 'selection'>,
  splittableMarks?: string[],
) {
  const { selection, storedMarks } = preSplitState
  const marks = storedMarks || (selection.$to.parentOffset && selection.$from.marks())

  if (marks) {
    const filteredMarks = marks.filter(mark => splittableMarks?.includes(mark.type.name))

    tr.ensureMarks(filteredMarks)
  }
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    splitBlock: {
      /**
       * Forks a new node from an existing node.
       * @param options.keepMarks Keep marks from the previous node.
       * @example editor.commands.splitBlock()
       * @example editor.commands.splitBlock({ keepMarks: true })
       */
      splitBlock: (options?: { keepMarks?: boolean }) => ReturnType
    }
  }
}

export const splitBlock: RawCommands['splitBlock'] =
  ({ keepMarks = true } = {}) =>
  ({ tr, dispatch, editor }) => {
    const { selection, doc } = tr
    const { $from } = selection
    const extensionAttributes = editor.extensionManager.attributes

    if (selection instanceof NodeSelection && selection.node.isBlock) {
      if (!$from.parentOffset || !canSplit(doc, $from.pos)) {
        return false
      }

      if (dispatch) {
        const preSplitState = { storedMarks: tr.storedMarks, selection: tr.selection }

        tr.split($from.pos).scrollIntoView()

        if (keepMarks) {
          ensureMarks(tr, preSplitState, editor.extensionManager.splittableMarks)
        }
      }

      return true
    }

    const deletedTr = previewDeleteSelection(tr)
    const splitState = deletedTr ?? tr
    const { selection: splitSelection, doc: splitDoc } = splitState
    const { $from: splitFrom, $to: splitTo } = splitSelection

    if (!splitFrom.parent.isBlock) {
      return false
    }

    const newAttributes = getSplittedAttributes(
      extensionAttributes,
      splitFrom.node().type.name,
      splitFrom.node().attrs,
    )

    const atEnd = splitTo.parentOffset === splitTo.parent.content.size

    const deflt =
      splitFrom.depth === 0
        ? undefined
        : defaultBlockAt(splitFrom.node(-1).contentMatchAt(splitFrom.indexAfter(-1)))

    let types =
      atEnd && deflt
        ? [
            {
              type: deflt,
              attrs: newAttributes,
            },
          ]
        : undefined

    let can = canSplit(splitDoc, splitFrom.pos, 1, types)

    if (
      !types &&
      !can &&
      canSplit(splitDoc, splitFrom.pos, 1, deflt ? [{ type: deflt }] : undefined)
    ) {
      can = true
      types = deflt
        ? [
            {
              type: deflt,
              attrs: newAttributes,
            },
          ]
        : undefined
    }

    if (!can) {
      return false
    }

    if (dispatch) {
      const preSplitState = { storedMarks: splitState.storedMarks, selection: splitSelection }

      if (deletedTr) {
        tr.deleteSelection()
      }

      const mapFrom = tr.steps.length

      tr.split(splitFrom.pos, 1, types)

      if (deflt && !atEnd && !splitFrom.parentOffset && splitFrom.parent.type !== deflt) {
        const first = tr.mapping.slice(mapFrom).map(splitFrom.before())
        const $first = tr.doc.resolve(first)

        if (splitFrom.node(-1).canReplaceWith($first.index(), $first.index() + 1, deflt)) {
          tr.setNodeMarkup(first, deflt)
        }
      }

      if (keepMarks) {
        ensureMarks(tr, preSplitState, editor.extensionManager.splittableMarks)
      }

      tr.scrollIntoView()
    }

    return true
  }
