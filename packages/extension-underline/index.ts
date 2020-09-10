import { Mark } from '@tiptap/core'

declare module '@tiptap/core/src/Editor' {
  interface Editor {
    underline(): Editor,
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
    underline: next => () => {
      editor.toggleMark(name)
      next()
    },
  }))
  .keys(({ editor }) => ({
    'Mod-u': () => editor.underline()
  }))
  .create()
