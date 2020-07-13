import { Editor } from '../Editor'

type RemoveMarks = () => any

declare module '../Editor' {
  interface Editor {
    removeMarks: RemoveMarks,
  }
}

export default (next: Function, editor: Editor): RemoveMarks => () => {
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
