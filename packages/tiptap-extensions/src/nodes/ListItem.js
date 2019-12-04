import { Node } from 'tiptap'
import { ALIGN_PATTERN } from 'tiptap/Utils'
import { splitListItem, liftListItem, sinkListItem } from 'tiptap-commands'

function getAttrs(dom) {
  const { textAlign } = dom.style
  let align = dom.getAttribute('data-align') || textAlign || ''

  align = ALIGN_PATTERN.test(align)
    ? align
    : null

  return align
    ? { align }
    : {}
}

function toDOM(node) {
    const { align } = node.attrs
    const attrs = align
        ? { align }
        : {}

    return ['li', attrs, 0]
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
