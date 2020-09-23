import { Plugin } from 'prosemirror-state'
import Editor from '../..'

export default (editor: Editor) => new Plugin({
  props: {
    attributes: {
      tabindex: '0',
    },
    handleDOMEvents: {
      focus: () => {
        editor.isFocused = true

        const transaction = editor.state.tr.setMeta('focused', true)
        editor.view.dispatch(transaction)

        return true
      },
      blur: () => {
        editor.isFocused = false

        const transaction = editor.state.tr.setMeta('focused', false)
        editor.view.dispatch(transaction)

        return true
      },
    },
  },
})
