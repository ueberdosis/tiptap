import { Mark, markInputRule, markPasteRule } from '@tiptap/core'
import VerEx from 'verbal-expressions'

declare module '@tiptap/core/src/Editor' {
  interface Editor {
    bold(): Editor,
  }
}

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
  .inputRules(({ type }) => {
    return ['**', '__'].map(character => {
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
  // .pasteRules(({ type }) => {
  //   return ['**', '__'].map(character => {
  //     const regex = VerEx()
  //       .add('(?:^|\\s)')
  //       .beginCapture()
  //       .find(character)
  //       .beginCapture()
  //       .somethingBut(character)
  //       .endCapture()
  //       .find(character)
  //       .endCapture()

  //     return markPasteRule(regex, type)
  //   })
  // })
  .create()
