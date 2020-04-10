import { Editor } from '../Editor'

declare module '../Editor' {
  interface Editor {
    removeMarks(): Editor,
  }
}

export default function removeMarks(next: Function, editor: Editor): void {
  const { state, view, schema } = editor
  const { selection, tr } = state
  const { from, to, empty } = selection
  let transaction = tr

  if (empty) {
    next()
    return
  }

  Object
    .entries(schema.marks)
    .forEach(([name, mark]) => {
      transaction.removeMark(from, to, mark)
    })

  view.dispatch(transaction)
  next()
}
