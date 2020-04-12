import { Mark, markInputRule, markPasteRule, CommandSpec } from '@tiptap/core'
import { toggleMark } from 'prosemirror-commands'
import { MarkSpec } from 'prosemirror-model'
import VerEx from 'verbal-expressions'

declare module '@tiptap/core/src/Editor' {
  interface Editor {
    code(): Editor,
  }
}

export default class Code extends Mark {

  name = 'code'

  schema(): MarkSpec {
    return {
      excludes: '_',
      parseDOM: [
        { tag: 'code' },
      ],
      toDOM: () => ['code', 0],
    }
  }

  commands(): CommandSpec {
    return {
      code: (next, { view }) => {
        toggleMark(this.type)(view.state, view.dispatch)
        next()
      },
    }
  }

  keys() {
    return {
      'Mod-`': () => this.editor.code(),
    }
  }

  inputRules() {
    return markInputRule(
      VerEx()
        .add('(?:^|\\s)')
        .beginCapture()
        .find('`')
        .beginCapture()
        .somethingBut('`')
        .endCapture()
        .find('`')
        .endCapture()
        .endOfLine(),
      this.type,
    )
  }

  pasteRules() {
    return markPasteRule(
      VerEx()
        .add('(?:^|\\s)')
        .beginCapture()
        .find('`')
        .beginCapture()
        .somethingBut('`')
        .endCapture()
        .find('`')
        .endCapture(),
      this.type,
    )
  }

}