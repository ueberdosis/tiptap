export default function getParagraphDOM(node) {
  const {
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

  return ['p', attrs, 0]
}
