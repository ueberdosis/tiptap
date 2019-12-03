import { ALIGN_PATTERN } from './alignment'

export default function getParagraphNodeAttrs(dom) {
  const {
    textAlign,
  } = dom.style

  const id = dom.getAttribute('id') || ''

  let align = dom.getAttribute('align') || textAlign || ''
  align = ALIGN_PATTERN.test(align)
    ? align
    : null

  return {
    id,
    align,
  }
}
