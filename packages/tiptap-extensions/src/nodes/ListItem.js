import { Node, getParagraphNodeAttrs, getParagraphDOM } from 'tiptap'
import { splitListItem, liftListItem, sinkListItem } from 'tiptap-commands'

function getAttrs(dom) {
    return getParagraphNodeAttrs(dom)
}

function toDOM(node) {
    const dom = getParagraphDOM(node)

    dom[0] = 'li'

    return dom
}

export default class ListItem extends Node {

  get name() {
    return 'list_item'
  }

  get schema() {
    return {
      attrs: {
        align: { default: null },
      },
      content: 'paragraph block*',
      defining: true,
      draggable: false,
      parseDOM: [
        {
          tag: 'li',
          getAttrs,
        },
      ],
      toDOM,
    }
  }

  keys({ type }) {
    return {
      Enter: splitListItem(type),
      Tab: sinkListItem(type),
      'Shift-Tab': liftListItem(type),
    }
  }

}
