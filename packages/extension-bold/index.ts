import { Mark, CommandSpec, markInputRule, markPasteRule } from '@tiptap/core'
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

  commands(): CommandSpec {
    return {
      bold: (next, { view }) => {
        toggleMark(this.type)(view.state, view.dispatch)
        next()
      },
    }
  }

  keys() {
    return {
      'Mod-b': () => this.editor.bold(),
    }
  }

  inputRules() {
    return ['**', '__'].map(character => {
      return markInputRule(
        VerEx()
          .add('(?:^|\\s)')
          .beginCapture()
          .find(character)
          .beginCapture()
          .somethingBut(character)
          .endCapture()
          .find(character)
          .endCapture()
          .endOfLine(),
        this.type,
      )
    })
  }

  pasteRules() {
    return ['**', '__'].map(character => {
      return markPasteRule(
        VerEx()
          .add('(?:^|\\s)')
          .beginCapture()
          .find(character)
          .beginCapture()
          .somethingBut(character)
          .endCapture()
          .find(character)
          .endCapture(),
        this.type,
      )
    })
  }

}