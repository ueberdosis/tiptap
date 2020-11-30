import { EditorState, TextSelection } from 'prosemirror-state'
import { Command, FocusPosition } from '../types'
import minMax from '../utilities/minMax'

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

/**
 * Focus the editor at the given position.
 */
export const focus = (position: FocusPosition = null): Command => ({
  editor,
  view,
  tr,
  dispatch,
}) => {
  if ((view.hasFocus() && position === null) || position === false) {
    return true
  }

  const { from, to } = resolveSelection(editor.state, position) || editor.state.selection
  const { doc } = tr
  const resolvedFrom = minMax(from, 0, doc.content.size)
  const resolvedEnd = minMax(to, 0, doc.content.size)
  const selection = TextSelection.create(doc, resolvedFrom, resolvedEnd)

  if (dispatch) {
    tr.setSelection(selection)
    view.focus()
  }

  return true
}
