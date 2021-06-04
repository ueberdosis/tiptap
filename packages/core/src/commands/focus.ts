import { EditorState, TextSelection } from 'prosemirror-state'
import { RawCommands, FocusPosition } from '../types'
import minMax from '../utilities/minMax'
import isTextSelection from '../helpers/isTextSelection'

function resolveSelection(state: EditorState, position: FocusPosition = null) {
  if (!position) {
    return null
  }

  if (position === 'start' || position === true) {
    return {
      from: 0,
      to: 0,
    }
  }

  if (position === 'end') {
    const { size } = state.doc.content

    return {
      from: size,
      to: size,
    }
  }

  return {
    from: position,
    to: position,
  }
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    focus: {
      /**
       * Focus the editor at the given position.
       */
      focus: (position?: FocusPosition) => ReturnType,
    }
  }
}

export const focus: RawCommands['focus'] = (position = null) => ({
  editor,
  view,
  tr,
  dispatch,
}) => {
  if ((view.hasFocus() && position === null) || position === false) {
    return true
  }

  // we don’t try to resolve a NodeSelection or CellSelection
  if (dispatch && position === null && !isTextSelection(editor.state.selection)) {
    view.focus()
    return true
  }

  const { from, to } = resolveSelection(editor.state, position) || editor.state.selection
  const { doc, storedMarks } = tr
  const resolvedFrom = minMax(from, 0, doc.content.size)
  const resolvedEnd = minMax(to, 0, doc.content.size)
  const selection = TextSelection.create(doc, resolvedFrom, resolvedEnd)
  const isSameSelection = editor.state.selection.eq(selection)

  if (dispatch) {
    tr.setSelection(selection)

    // `tr.setSelection` resets the stored marks
    // so we’ll restore them if the selection is the same as before
    if (isSameSelection && storedMarks) {
      tr.setStoredMarks(storedMarks)
    }

    view.focus()
  }

  return true
}
