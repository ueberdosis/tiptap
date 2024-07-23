import { EditorState, NodeSelection, TextSelection } from '@tiptap/pm/state'
import { canSplit } from '@tiptap/pm/transform'

import { defaultBlockAt } from '../helpers/defaultBlockAt.js'
import { getSplittedAttributes } from '../helpers/getSplittedAttributes.js'
import { RawCommands } from '../types.js'

function ensureMarks(state: EditorState, splittableMarks?: string[]) {
  const marks = state.storedMarks || (state.selection.$to.parentOffset && state.selection.$from.marks())

  if (marks) {
    const filteredMarks = marks.filter(mark => splittableMarks?.includes(mark.type.name))

    state.tr.ensureMarks(filteredMarks)
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

export const splitBlock: RawCommands['splitBlock'] = ({ keepMarks = true } = {}) => ({
  tr, state, dispatch, editor,
}) => {
  const { selection, doc } = tr
  const { $from, $to } = selection
  const extensionAttributes = editor.extensionManager.attributes
  const newAttributes = getSplittedAttributes(
    extensionAttributes,
    $from.node().type.name,
    $from.node().attrs,
  )

  if (selection instanceof NodeSelection && selection.node.isBlock) {
    if (!$from.parentOffset || !canSplit(doc, $from.pos)) {
      return false
    }

    if (dispatch) {
      if (keepMarks) {
        ensureMarks(state, editor.extensionManager.splittableMarks)
      }

      tr.split($from.pos).scrollIntoView()
    }

    return true
  }

  if (!$from.parent.isBlock) {
    return false
  }

  const atEnd = $to.parentOffset === $to.parent.content.size

  const deflt = $from.depth === 0
    ? undefined
    : defaultBlockAt($from.node(-1).contentMatchAt($from.indexAfter(-1)))

  let types = atEnd && deflt
    ? [
      {
        type: deflt,
        attrs: newAttributes,
      },
    ]
    : undefined

  let can = canSplit(tr.doc, tr.mapping.map($from.pos), 1, types)

  if (
    !types
      && !can
      && canSplit(tr.doc, tr.mapping.map($from.pos), 1, deflt ? [{ type: deflt }] : undefined)
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

  if (dispatch) {
    if (can) {
      if (selection instanceof TextSelection) {
        tr.deleteSelection()
      }

      tr.split(tr.mapping.map($from.pos), 1, types)

      if (deflt && !atEnd && !$from.parentOffset && $from.parent.type !== deflt) {
        const first = tr.mapping.map($from.before())
        const $first = tr.doc.resolve(first)

        if ($from.node(-1).canReplaceWith($first.index(), $first.index() + 1, deflt)) {
          tr.setNodeMarkup(tr.mapping.map($from.before()), deflt)
        }
      }
    }

    if (keepMarks) {
      ensureMarks(state, editor.extensionManager.splittableMarks)
    }

    tr.scrollIntoView()
  }

  return can
}
