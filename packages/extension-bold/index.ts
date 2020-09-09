import { Mark, markInputRule, markPasteRule } from '@tiptap/core'

declare module '@tiptap/core/src/Editor' {
  interface Editor {
    bold(): Editor,
  }
}

export const starInputRegex = /(?:^|\s)((?:\*\*)((?:[^\*\*]+))(?:\*\*))$/gm
export const starPasteRegex = /(?:^|\s)((?:\*\*)((?:[^\*\*]+))(?:\*\*))/gm
export const underscoreInputRegex = /(?:^|\s)((?:__)((?:[^__]+))(?:__))$/gm
export const underscorePasteRegex = /(?:^|\s)((?:__)((?:[^__]+))(?:__))/gm

export default new Mark()
  .name('bold')
  .schema(() => ({
    parseDOM: [
      {
        tag: 'strong',
      },
      {
        tag: 'b',
        getAttrs: node => (node as HTMLElement).style.fontWeight !== 'normal' && null,
      },
      {
        style: 'font-weight',
        getAttrs: value => /^(bold(er)?|[5-9]\d{2,})$/.test(value as string) && null,
      },
    ],
    toDOM: () => ['strong', 0],
  }))
  .commands(({ editor, name, type }) => ({
    bold: next => () => {
      editor.toggleMark(name)
      next()
    },
  }))
  .keys(({ editor }) => ({
    'Mod-b': () => editor.bold()
  }))
  .inputRules(({ type }) => [
    markInputRule(starInputRegex, type),
    markInputRule(underscoreInputRegex, type),
  ])
  .pasteRules(({ type }) => [
    markPasteRule(starPasteRegex, type),
    markPasteRule(underscorePasteRegex, type),
  ])
  .create()
