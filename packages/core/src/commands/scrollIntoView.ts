import { Command } from '../Editor'

type ScrollIntoViewCommand = () => Command

declare module '../Editor' {
  interface Commands {
    scrollIntoView: ScrollIntoViewCommand,
  }
}

export const scrollIntoView: ScrollIntoViewCommand = () => ({ tr }) => {
  tr.scrollIntoView()

  return true
}
