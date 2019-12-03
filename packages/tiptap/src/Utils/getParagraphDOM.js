import { ATTRIBUTE_INDENT } from './indent'

export default function getParagraphDOM(node) {
  const {
    id,
    align,
  } = node.attrs

  const attrs = {}
  let style = ''

  if (align && align !== 'left') {
    style += `text-align: ${align};`
  }

  if (style) {
    attrs.style = style
  }

  if (id) {
    attrs.id = id
  }

  return ['p', attrs, 0]
}
