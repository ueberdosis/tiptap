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
        toggleMark(this.schemaType)(view.state, view.dispatch)
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
    return ['`'].map(character => ([
      // match start of line
      markInputRule(
        VerEx()
          .startOfLine()
          .beginCapture()
          .find(character)
          .beginCapture()
          .somethingBut(character)
          .endCapture()
          .find(character)
          .endCapture()
          .endOfLine(),
        this.schemaType,
      ),
      // match before whitespace
      markInputRule(
        VerEx()
          .whitespace()
          .beginCapture()
          .find(character)
          .beginCapture()
          .somethingBut(character)
          .endCapture()
          .find(character)
          .endCapture()
          .endOfLine(),
        this.schemaType,
      ),
    ]))
    .flat(1)
  }

  pasteRules() {
    return ['`'].map(character => ([
      // match start of line
      markPasteRule(
        VerEx()
          .startOfLine()
          .beginCapture()
          .find(character)
          .beginCapture()
          .somethingBut(character)
          .endCapture()
          .find(character)
          .endCapture(),
        this.schemaType,
      ),
      // match before whitespace
      markPasteRule(
        VerEx()
          .whitespace()
          .beginCapture()
          .find(character)
          .beginCapture()
          .somethingBut(character)
          .endCapture()
          .find(character)
          .endCapture(),
        this.schemaType,
      ),
    ]))
    .flat(1)
  }

}