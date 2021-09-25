import { Plugin, PluginKey } from 'prosemirror-state'
import { Extension } from '../Extension'

export const FocusEvents = Extension.create({
  name: 'focusEvents',

  addProseMirrorPlugins() {
    const { editor } = this

    return [
      new Plugin({
        key: new PluginKey('focusEvents'),
        props: {
          handleDOMEvents: {
            focus: (view, event) => {
              editor.isFocused = true

              const transaction = editor.state.tr
                .setMeta('focus', { event })
                .setMeta('addToHistory', false)

              view.dispatch(transaction)

              return false
            },
            blur: (view, event) => {
              editor.isFocused = false

              const transaction = editor.state.tr
                .setMeta('blur', { event })
                .setMeta('addToHistory', false)

              view.dispatch(transaction)

              return false
            },
          },
        },
      }),
    ]
  },
})
