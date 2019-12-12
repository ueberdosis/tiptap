import { Node, getParagraphNodeAttrs, getParagraphDOM } from 'tiptap'
import { setBlockType, textblockTypeInputRule, toggleBlockType } from 'tiptap-commands'

function getAttrs(dom) {
  return {
    ...getParagraphNodeAttrs(dom),
    level: Number(dom.nodeName[1] || 1),
  }
}

function toDOM(node) {
  const dom = getParagraphDOM(node)
  const level = node.attrs.level || 1

  dom[0] = `h${level}`

  return dom
}

export default class Heading extends Node {

  get name() {
    return 'heading'
  }

  get defaultOptions() {
    return {
      levels: [1, 2, 3, 4, 5, 6],
    }
  }

  get schema() {
    return {
      attrs: {
        align: { default: null },
        level: { default: 1 },
      },
      content: 'inline*',
      group: 'block',
      defining: true,
      draggable: false,
      parseDOM: this.options.levels
        .map(level => ({
          tag: `h${level}`,
          getAttrs,
        })),
      toDOM,
    }
  }

  commands({ type, schema }) {
    return attrs => toggleBlockType(type, schema.nodes.paragraph, attrs)
  }

  keys({ type }) {
    return this.options.levels.reduce((items, level) => ({
      ...items,
      ...{
        [`Shift-Ctrl-${level}`]: setBlockType(type, { level }),
      },
    }), {})
  }

  inputRules({ type }) {
    return this.options.levels.map(level => textblockTypeInputRule(
      new RegExp(`^(#{1,${level}})\\s$`),
      type,
      () => ({ level }),
    ))
  }

}
