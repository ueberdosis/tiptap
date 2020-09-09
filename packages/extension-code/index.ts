import { Mark, markInputRule, markPasteRule } from '@tiptap/core'

declare module '@tiptap/core/src/Editor' {
  interface Editor {
    code(): Editor,
  }
}

export const inputRegex = /(?:^|\s)((?:`)((?:[^`]+))(?:`))$/gm
export const pasteRegex = /(?:^|\s)((?:`)((?:[^`]+))(?:`))/gm

export default new Mark()
  .name('code')
  .schema(() => ({
    excludes: '_',
    parseDOM: [
      { tag: 'code' },
    ],
    toDOM: () => ['code', 0],
  }))
  .commands(({ editor, name }) => ({
    code: next => () => {
      editor.toggleMark(name)
      next()
    },
  }))
  .keys(({ editor }) => ({
    'Mod-`': () => editor.code()
  }))
  .inputRules(({ type }) => [
    markInputRule(inputRegex, type)
  ])
  .pasteRules(({ type }) => [
    markPasteRule(inputRegex, type)
  ])
  .create()
