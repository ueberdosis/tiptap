import { Command } from '../Editor'

type RemoveMarksCommand = () => Command

declare module '../Editor' {
  interface Editor {
    removeMarks: RemoveMarksCommand,
  }
}

export const removeMarks: RemoveMarksCommand = () => ({ tr, state }) => {
  const { selection } = tr
  const { from, to, empty } = selection

  if (empty) {
    return true
  }

  Object
    .entries(state.schema.marks)
    .forEach(([name, mark]) => {
      tr.removeMark(from, to, mark)
    })

  return true
}
