import { Mark, markInputRule, markPasteRule } from '@tiptap/core'
import VerEx from 'verbal-expressions'

declare module '@tiptap/core/src/Editor' {
  interface Editor {
    italic(): Editor,
  }
}

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
  .inputRules(({ type }) => {
    return ['*', '_'].map(character => {
      const regex = VerEx()
        .add('(?:^|\\s)')
        .beginCapture()
        .find(character)
        .beginCapture()
        .somethingBut(character)
        .endCapture()
        .find(character)
        .endCapture()
        .endOfLine()

      return markInputRule(regex, type)
    })
  })
  .pasteRules(({ type }) => {
    return ['*', '_'].map(character => {
      const regex = VerEx()
        .add('(?:^|\\s)')
        .beginCapture()
        .find(character)
        .beginCapture()
        .somethingBut(character)
        .endCapture()
        .find(character)
        .endCapture()

      return markPasteRule(regex, type)
    })
  })
  .create()
