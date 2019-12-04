import { Node } from 'tiptap'
import { getParagraphNodeAttrs, getParagraphDOM } from 'tiptap/Utils'
import { wrappingInputRule, toggleWrap } from 'tiptap-commands'

function getAttrs(dom) {
  return getParagraphNodeAttrs(dom)
}

function toDOM(node) {
  const dom = getParagraphDOM(node)

  dom[0] = 'blockquote'

  return dom
}

export default class Blockquote extends Node {

  get name() {
    return 'blockquote'
  }

  get schema() {
    return {
      attrs: {
        align: { default: null },
      },
      content: 'block*',
      group: 'block',
      defining: true,
      draggable: false,
      parseDOM: [
        {
          tag: 'blockquote',
          getAttrs,
        },
      ],
      toDOM,
    }
  }

  commands({ type, schema }) {
    return () => toggleWrap(type, schema.nodes.paragraph)
  }

  keys({ type }) {
    return {
      'Ctrl->': toggleWrap(type),
    }
  }

  inputRules({ type }) {
    return [
      wrappingInputRule(/^\s*>\s$/, type),
    ]
  }

}
