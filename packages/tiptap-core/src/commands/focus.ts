import { Editor } from '../Editor'
import { TextSelection } from 'prosemirror-state'
import sleep from '../utils/sleep'
import minMax from '../utils/minMax'

declare module '../Editor' {
  interface Editor {
    focus(position: Position): Editor
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
      to: size,
    }
  }

  return {
    from: position as number,
    to: position as number,
  }
}

export default async function focus(next: Function, editor: Editor, position: Position = null): Promise<void> {
  const { view, state } = editor

  if ((view.hasFocus && position === null)) {
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