import { toggleBlockType } from 'tiptap-commands'
import Node from '../Utils/Node'
import getParagraphNodeAttrs from '../Utils/getParagraphNodeAttrs'
import getParagraphDOM from '../Utils/getParagraphDOM'

function getAttrs(dom) {
    return getParagraphNodeAttrs(dom)
}

function toDOM(node) {
    return getParagraphDOM(node)
}

export default class Paragraph extends Node {

  get name() {
    return 'paragraph'
  }

  get schema() {
    return {
      attrs: {
        align: { default: null },
      },
      content: 'inline*',
      group: 'block',
      draggable: false,
      parseDOM: [{
        tag: 'p',
        getAttrs,
      }],
      toDOM,
    }
  }

  commands({ type, schema }) {
    return () => toggleBlockType(type, schema.nodes.paragraph)
  }

}
