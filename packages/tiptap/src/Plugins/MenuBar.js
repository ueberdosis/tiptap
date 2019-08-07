import { Plugin, PluginKey } from 'prosemirror-state'

class Menu {

  constructor({ options }) {
    this.options = options

    // the mousedown event is fired before blur so we can prevent it
    this.options.element.addEventListener('mousedown', this.handleClick)
  }

  handleClick(event) {
    event.preventDefault()
  }

  destroy() {
    this.options.element.removeEventListener('mousedown', this.handleClick)
  }

}

export default function (options) {
  return new Plugin({
    key: new PluginKey('menu_bar'),
    view(editorView) {
      return new Menu({ editorView, options })
    },
  })
}
