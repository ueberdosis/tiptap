import { TextSelection } from 'prosemirror-state'
import { Editor, Command } from '../Editor'
import minMax from '../utils/minMax'

type Position = 'start' | 'end' | number | boolean | null
type FocusCommand = (position?: Position) => Command

declare module '../Editor' {
  interface Commands {
    focus: FocusCommand
  }
}

interface ResolvedSelection {
  from: number,
  to: number,
}

function resolveSelection(editor: Editor, position: Position = null): ResolvedSelection {
  if (position === null) {
    return editor.selection
  }

  if (position === 'start' || position === true) {
    return {
      from: 0,
      to: 0,
    }
  }

  if (position === 'end') {
    const { size } = editor.state.doc.content

    return {
      from: size,
      to: size - 1, // TODO: -1 only for nodes with content
    }
  }

  return {
    from: position as number,
    to: position as number,
  }
}

export const focus: FocusCommand = (position = null) => ({ editor, view, tr }) => {
  if ((view.hasFocus() && position === null) || position === false) {
    return true
  }

  const { from, to } = resolveSelection(editor, position)
  const { doc } = tr
  const resolvedFrom = minMax(from, 0, doc.content.size)
  const resolvedEnd = minMax(to, 0, doc.content.size)
  const selection = TextSelection.create(doc, resolvedFrom, resolvedEnd)

  tr.setSelection(selection)
  view.focus()

  return true
}
