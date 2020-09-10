import { Mark, markInputRule, markPasteRule } from '@tiptap/core'

declare module '@tiptap/core/src/Editor' {
  interface Editor {
    strike(): Editor,
  }
}

export const inputRegex = /(?:^|\s)((?:~)((?:[^~]+))(?:~))$/gm
export const pasteRegex = /(?:^|\s)((?:~)((?:[^~]+))(?:~))/gm

export default new Mark()
  .name('strike')
  .schema(() => ({
    parseDOM: [
      {
        tag: 's',
      },
      {
        tag: 'del',
      },
      {
        tag: 'strike',
      },
      {
        style: 'text-decoration',
        getAttrs: node => node === 'line-through' ? {} : false,
      },
    ],
    toDOM: () => ['s', 0],
  }))
  .commands(({ editor, name }) => ({
    strike: next => () => {
      editor.toggleMark(name)
      next()
    },
  }))
  .keys(({ editor }) => ({
    'Mod-d': () => editor.strike()
  }))
  .inputRules(({ type }) => [
    markInputRule(inputRegex, type)
  ])
  .pasteRules(({ type }) => [
    markPasteRule(inputRegex, type)
  ])
  .create()
