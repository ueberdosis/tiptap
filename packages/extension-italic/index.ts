import { Mark, markInputRule, markPasteRule, CommandSpec } from '@tiptap/core'
import { toggleMark } from 'prosemirror-commands'
import { MarkSpec } from 'prosemirror-model'
import VerEx from 'verbal-expressions'

declare module '@tiptap/core/src/Editor' {
  interface Editor {
    italic(): Editor,
  }
}

export default class Italic extends Mark {

  name = 'italic'

  schema(): MarkSpec {
    return {
      parseDOM: [
        { tag: 'i' },
        { tag: 'em' },
        { style: 'font-style=italic' },
      ],
      toDOM: () => ['em', 0],
    }
  }

  commands(): CommandSpec {
    return {
      italic: (next, { view }) => {
        toggleMark(this.type)(view.state, view.dispatch)
        next()
      },
    }
  }

  keys() {
    return {
      'Mod-i': () => this.editor.italic()
    }
  }

  inputRules() {
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

      return markInputRule(regex, this.type)
    })
  }

  pasteRules() {
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

      return markPasteRule(regex, this.type)
    })
  }

}