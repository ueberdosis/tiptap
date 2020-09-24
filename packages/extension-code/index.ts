import {
  Command, Mark, markInputRule, markPasteRule,
} from '@tiptap/core'

export type CodeCommand = () => Command

declare module '@tiptap/core/src/Editor' {
  interface Commands {
    code: CodeCommand,
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
  .commands(({ name }) => ({
    code: () => ({ commands }) => {
      return commands.toggleMark(name)
    },
  }))
  .keys(({ editor }) => ({
    'Mod-`': () => editor.code(),
  }))
  .inputRules(({ type }) => [
    markInputRule(inputRegex, type),
  ])
  .pasteRules(({ type }) => [
    markPasteRule(inputRegex, type),
  ])
  .create()
