import { Editor } from '../Editor'

type BlurCommand = () => Editor

declare module '../Editor' {
  interface Editor {
    blur: BlurCommand,
  }
}

export default (next: Function, { view }: Editor) => () => {
  const element = view.dom as HTMLElement

  element.blur()
  next()
}
