import { Command, Node } from '@tiptap/core'
import { chainCommands, exitCode } from 'prosemirror-commands'

export type HardBreakCommand = () => Command

declare module '@tiptap/core/src/Editor' {
  interface Commands {
    hardBreak: HardBreakCommand,
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
    hardBreak: () => ({ tr, state, dispatch, view }) => {
      return chainCommands(exitCode, () => {
        dispatch(tr.replaceSelectionWith(type.create()).scrollIntoView())
        return true
      })(state, dispatch, view)
    },
  }))
  .keys(({ editor }) => ({
    'Mod-Enter': () => editor.hardBreak(),
    'Shift-Enter': () => editor.hardBreak(),
  }))
  .create()
