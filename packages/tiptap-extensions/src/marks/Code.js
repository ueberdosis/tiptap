import { Mark } from 'tiptap'
import { toggleMark, markInputRule, markPasteRule } from 'tiptap-commands'

export default class Code extends Mark {

  get name() {
    return 'code'
  }

  get schema() {
    return {
      excludes: '_',
      parseDOM: [
        { tag: 'code' },
      ],
      toDOM: () => ['code', 0],
    }
  }

  keys({ type }) {
    return {
      'Mod-`': toggleMark(type),
    }
  }

  commands({ type }) {
    return () => toggleMark(type)
  }

  inputRules({ type }) {
    return [
      markInputRule(/(?:`)([^`]+)(?:`)$/, type),
    ]
  }

  pasteRules({ type }) {
    return [
      markPasteRule(/(?:`)([^`]+)(?:`)/g, type),
    ]
  }

}
