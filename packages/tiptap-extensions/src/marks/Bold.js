import { Mark } from 'tiptap'
import { toggleMark, markInputRule, markPasteRule } from 'tiptap-commands'

export default class Bold extends Mark {

  get name() {
    return 'bold'
  }

  get schema() {
    return {
      parseDOM: [
        {
          tag: 'strong',
        },
        {
          tag: 'b',
          getAttrs: node => node.style.fontWeight !== 'normal' && null,
        },
        {
          style: 'font-weight',
          getAttrs: value => /^(bold(er)?|[5-9]\d{2,})$/.test(value) && null,
        },
      ],
      toDOM: () => ['strong', 0],
    }
  }

  keys({ type }) {
    return {
      'Mod-b': toggleMark(type),
    }
  }

  commands({ type }) {
    return () => toggleMark(type)
  }

  inputRules({ type }) {
    return [
      markInputRule(/(?:\*\*|__)([^*_]+)(?:\*\*|__)$/, type),
    ]
  }

  pasteRules({ type }) {
    return [
      markPasteRule(/(?:\*\*|__)([^*_]+)(?:\*\*|__)/g, type),
    ]
  }

}
