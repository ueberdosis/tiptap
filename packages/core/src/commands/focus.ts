import { EditorState, Selection, TextSelection } from 'prosemirror-state'
import { RawCommands, FocusPosition } from '../types'
import minMax from '../utilities/minMax'
import isTextSelection from '../helpers/isTextSelection'
import isiOS from '../utilities/isiOS'

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

  const { size } = state.doc.content

  if (position === 'end') {
    return {
      from: size,
      to: size,
    }
  }

  if (position === 'all') {
    return {
      from: 0,
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
      focus: (
        position?: FocusPosition,
        options?: {
          scrollIntoView?: boolean,
        },
      ) => ReturnType,
    }
  }
}

export const focus: RawCommands['focus'] = (position = null, options) => ({
  editor,
  view,
  tr,
  dispatch,
}) => {
  options = {
    scrollIntoView: true,
    ...options,
  }

  const delayedFocus = () => {
    // focus within `requestAnimationFrame` breaks focus on iOS
    // so we have to call this
    if (isiOS()) {
      (view.dom as HTMLElement).focus()
    }

    // For React we have to focus asynchronously. Otherwise wild things happen.
    // see: https://github.com/ueberdosis/tiptap/issues/1520
    requestAnimationFrame(() => {
      if (!editor.isDestroyed) {
        view.focus()

        if (options?.scrollIntoView) {
          editor.commands.scrollIntoView()
        }
      }
    })
  }

  if ((view.hasFocus() && position === null) || position === false) {
    return true
  }

  // we don’t try to resolve a NodeSelection or CellSelection
  if (dispatch && position === null && !isTextSelection(editor.state.selection)) {
    delayedFocus()
    return true
  }

  const { from, to } = resolveSelection(editor.state, position) || editor.state.selection
  const { doc, storedMarks } = tr
  const minPos = Selection.atStart(doc).from
  const maxPos = Selection.atEnd(doc).to
  const resolvedFrom = minMax(from, minPos, maxPos)
  const resolvedEnd = minMax(to, minPos, maxPos)
  const selection = TextSelection.create(doc, resolvedFrom, resolvedEnd)
  const isSameSelection = editor.state.selection.eq(selection)

  if (dispatch) {
    if (!isSameSelection) {
      tr.setSelection(selection)
    }

    // `tr.setSelection` resets the stored marks
    // so we’ll restore them if the selection is the same as before
    if (isSameSelection && storedMarks) {
      tr.setStoredMarks(storedMarks)
    }

    delayedFocus()
  }

  return true
}
