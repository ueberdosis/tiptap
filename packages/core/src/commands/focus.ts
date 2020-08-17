import { Editor } from '../Editor'
import { TextSelection } from 'prosemirror-state'
import sleep from '../utils/sleep'
import minMax from '../utils/minMax'

type FocusCommand = (position?: Position) => Editor

declare module '../Editor' {
  interface Editor {
    focus: FocusCommand
  }
}

interface ResolvedSelection {
  from: number,
  to: number,
}

type Position = 'start' | 'end' | number | null

function resolveSelection(editor: Editor, position: Position = null): ResolvedSelection {
  if (position === null) {
    return editor.selection
  }

  if (position === 'start') {
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

export default (next: Function, editor: Editor) => async (position = null) => {
  const { view, state } = editor

  if ((view.hasFocus() && position === null)) {
    next()
    return
  }

  const { from, to } = resolveSelection(editor, position)
  const { doc, tr } = state
  const resolvedFrom = minMax(from, 0, doc.content.size)
  const resolvedEnd = minMax(to, 0, doc.content.size)
  const selection = TextSelection.create(doc, resolvedFrom, resolvedEnd)
  const transaction = tr.setSelection(selection)

  view.dispatch(transaction)
  await sleep(10)
  view.focus()
  next()
}