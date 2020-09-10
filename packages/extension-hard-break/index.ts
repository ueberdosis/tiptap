import { Node } from '@tiptap/core'
import { chainCommands, exitCode } from 'prosemirror-commands'

declare module '@tiptap/core/src/Editor' {
  interface Editor {
    hardBreak(): Editor,
  }
}

export default new Node()
  .name('hardBreak')
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
    hardBreak: next => () => {
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
    'Mod-Enter': () => editor.hardBreak(),
    'Shift-Enter': () => editor.hardBreak(),
  }))
  .create()
