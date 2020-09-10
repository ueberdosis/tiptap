import { Node } from '@tiptap/core'
import { chainCommands, exitCode } from 'prosemirror-commands'

declare module '@tiptap/core/src/Editor' {
  interface Editor {
    hardbreak(): Editor,
  }
}

export default new Node()
  .name('hardbreak')
  .schema(() => ({
    inline: true,
    group: 'inline',
    selectable: false,
    parseDOM: [
      { tag: 'br' },
    ],
    toDOM: () => ['br'],
  }))
  .commands(({ editor, type }) => ({
    hardbreak: next => () => {
      const { state, view } = editor
      const { dispatch } = view

      chainCommands(exitCode, () => {
        dispatch(state.tr.replaceSelectionWith(type.create()).scrollIntoView())
        return true
      })(state, dispatch, view)

      next()
    },
  }))
  .keys(({ editor }) => ({
    'Mod-Enter': () => editor.hardbreak(),
    'Shift-Enter': () => editor.hardbreak(),
  }))
  .create()
