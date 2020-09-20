import { Command } from '../Editor'

type BlurCommand = () => Command

declare module '../Editor' {
  interface Editor {
    blur: BlurCommand,
  }
}

export const blur: BlurCommand = () => ({ editor }) => {
  const element = editor.view.dom as HTMLElement

  element.blur()

  return true
}
