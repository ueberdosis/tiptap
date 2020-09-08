import { Mark, markInputRule, markPasteRule } from '@tiptap/core'
import VerEx from 'verbal-expressions'

declare module '@tiptap/core/src/Editor' {
  interface Editor {
    code(): Editor,
  }
}

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
  // .inputRules(({ type }) => {
  //   const regex = VerEx()
  //     .add('(?:^|\\s)')
  //     .beginCapture()
  //     .find('`')
  //     .beginCapture()
  //     .somethingBut('`')
  //     .endCapture()
  //     .find('`')
  //     .endCapture()
  //     .endOfLine()

  //   return [markInputRule(regex, type)]
  // })
  // .pasteRules(({ type }) => {
  //   const regex = VerEx()
  //     .add('(?:^|\\s)')
  //     .beginCapture()
  //     .find('`')
  //     .beginCapture()
  //     .somethingBut('`')
  //     .endCapture()
  //     .find('`')
  //     .endCapture()

  //   return [markPasteRule(regex, type)]
  // })
  .create()
