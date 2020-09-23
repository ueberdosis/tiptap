import { Command } from '../Editor'

type RemoveMarksCommand = () => Command

declare module '../Editor' {
  interface Commands {
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
    .forEach(([, mark]) => {
      tr.removeMark(from, to, mark as any)
    })

  return true
}
