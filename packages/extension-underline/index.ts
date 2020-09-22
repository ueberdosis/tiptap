import { Command, Mark } from '@tiptap/core'

export type UnderlineCommand = () => Command

declare module '@tiptap/core/src/Editor' {
  interface Commands {
    underline: UnderlineCommand,
  }
}

export default new Mark()
  .name('underline')
  .schema(() => ({
    parseDOM: [
      {
        tag: 'u',
      },
      {
        style: 'text-decoration',
        getAttrs: node => node === 'underline' ? {} : false,
      },
    ],
    toDOM: () => ['u', 0],
  }))
  .commands(({ editor, name }) => ({
    underline: () => ({ commands }) => {
      return commands.toggleMark(name)
    },
  }))
  .keys(({ editor }) => ({
    'Mod-u': () => editor.underline()
  }))
  .create()
