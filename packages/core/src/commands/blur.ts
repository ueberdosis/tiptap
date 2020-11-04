import { Command } from '../Editor'

export default (): Command => ({ view }) => {
  const element = view.dom as HTMLElement

  element.blur()

  return true
}
