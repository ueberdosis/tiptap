import { Command, Mark, markInputRule, markPasteRule } from '@tiptap/core'

type StrikeCommand = () => Command

declare module '@tiptap/core/src/Editor' {
  interface Editor {
    strike: StrikeCommand,
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
  .commands(({ name }) => ({
    strike: () => ({ commands }) => {
      return commands.toggleMark(name)
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
