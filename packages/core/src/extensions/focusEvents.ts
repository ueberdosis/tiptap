import { Plugin, PluginKey } from '@tiptap/pm/state'

import { Extension } from '../Extension.js'

export const FocusEvents = Extension.create({
  name: 'focusEvents',

  addProseMirrorPlugins() {
    const { editor } = this

    return [
      new Plugin({
        key: new PluginKey('focusEvents'),
        props: {
          handleDOMEvents: {
            focus: (view, event: Event) => {
              editor.isFocused = true

              const transaction = editor.state.tr
                .setMeta('focus', { event })
                .setMeta('addToHistory', false)

              view.dispatch(transaction)

              return false
            },
            blur: (view, event: Event) => {
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
