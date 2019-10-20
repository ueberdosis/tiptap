import { Plugin, PluginKey } from 'prosemirror-state'

class Menu {

  constructor({ options }) {
    this.options = options
    this.preventHide = false

    // the mousedown event is fired before blur so we can prevent it
    this.mousedownHandler = this.handleClick.bind(this)
    this.options.element.addEventListener('mousedown', this.mousedownHandler)

    this.options.editor.on('blur', () => {
      if (this.preventHide) {
        this.preventHide = false
        return
      }

      this.options.editor.emit('menubar:focusUpdate', false)
    })
  }

  handleClick() {
    this.preventHide = true
  }

  destroy() {
    this.options.element.removeEventListener('mousedown', this.mousedownHandler)
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
