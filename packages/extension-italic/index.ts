import { Mark, markInputRule, markPasteRule } from '@tiptap/core'

declare module '@tiptap/core/src/Editor' {
  interface Editor {
    italic(): Editor,
  }
}

export const starInputRegex = /(?:^|\s)((?:\*)((?:[^\*]+))(?:\*))$/gm
export const starPasteRegex = /(?:^|\s)((?:\*)((?:[^\*]+))(?:\*))/gm
export const underscoreInputRegex = /(?:^|\s)((?:_)((?:[^_]+))(?:_))$/gm
export const underscorePasteRegex = /(?:^|\s)((?:_)((?:[^_]+))(?:_))/gm

export default new Mark()
  .name('italic')
  .schema(() => ({
    parseDOM: [
      { tag: 'i' },
      { tag: 'em' },
      { style: 'font-style=italic' },
    ],
    toDOM: () => ['em', 0],
  }))
  .commands(({ editor, name }) => ({
    italic: next => () => {
      editor.toggleMark(name)
      next()
    },
  }))
  .keys(({ editor }) => ({
    'Mod-i': () => editor.italic()
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
