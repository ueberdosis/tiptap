import { Plugin, PluginKey } from 'prosemirror-state'
import { createExtension } from '../Extension'

export const FocusEvents = createExtension({
  addProseMirrorPlugins() {
    const { editor } = this

    return [
      new Plugin({
        key: new PluginKey('focusEvents'),
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
      }),
    ]
  },
})

declare module '../Editor' {
  interface AllExtensions {
    FocusEvents: typeof FocusEvents,
  }
}
