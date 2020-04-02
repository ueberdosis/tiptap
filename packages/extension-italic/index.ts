import { Mark, markInputRule, markPasteRule } from '@tiptap/core'
import { toggleMark } from 'prosemirror-commands'
import { MarkSpec } from 'prosemirror-model'

declare module '@tiptap/core/src/Editor' {
  interface Editor {
    italic(): Editor,
  }
}

export default class Italic extends Mark {

  name = 'italic'

  created() {
    this.editor.registerCommand('italic', (next, { view }) => {
      toggleMark(this.schemaType)(view.state, view.dispatch)
      next()
    })
  }

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

  keys() {
    return {
      'Mod-i': () => this.editor.italic(),
    }
  }

  inputRules() {
    return [
      markInputRule(/(?:^|[^_])(_([^_]+)_)$/, this.schemaType),
      // markInputRule(/(?:^|[^*])(\*([^*]+)\*)$/, this.schemaType),
    ]
  }

  pasteRules() {
    return [
      markPasteRule(/_([^_]+)_/g, this.schemaType),
      // markPasteRule(/\*([^*]+)\*/g, this.schemaType),
    ]
  }

}