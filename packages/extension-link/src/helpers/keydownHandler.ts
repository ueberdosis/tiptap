import { Plugin, PluginKey, TextSelection } from '@tiptap/pm/state'

export function keydownHandler(): Plugin {
  return new Plugin({
    key: new PluginKey('handleKeydownLink'),
    props: {
      handleKeyDown: (view, event) => {
        if (!view.editable) {
          return false
        }

        const { selection } = view.state

        if (event.key === 'Escape' && !selection.empty) {
          view.dispatch(view.state.tr.setSelection(TextSelection.create(view.state.doc, selection.to)))
          view.focus()
          return true
        }

        return false
      },
    },
  })
}
