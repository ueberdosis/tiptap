import { Mark, markInputRule, markPasteRule } from '@tiptap/core'
import { toggleMark } from 'prosemirror-commands'
import { MarkSpec } from 'prosemirror-model'
import VerEx from 'verbal-expressions'

declare module '@tiptap/core/src/Editor' {
  interface Editor {
    bold(): Editor,
  }
}

export default class Bold extends Mark {

  name = 'bold'

  created() {
    this.editor.registerCommand('bold', (next, { view }) => {
      toggleMark(this.schemaType)(view.state, view.dispatch)
      next()
    })
  }

  schema(): MarkSpec {
    return {
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
    }
  }

  keys() {
    return {
      'Mod-b': () => this.editor.bold(),
    }
  }

  inputRules() {
    return ['**', '__'].map(character => ([
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
    return ['**', '__'].map(character => ([
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