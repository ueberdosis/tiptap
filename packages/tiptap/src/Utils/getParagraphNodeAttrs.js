import { ALIGN_PATTERN } from './alignment'

export default function getParagraphNodeAttrs(dom) {
  const {
    textAlign,
  } = dom.style

  let align = dom.getAttribute('align') || textAlign || ''
  align = align && ALIGN_PATTERN.test(align)
    ? align
    : null

  return {
    align,
  }
}
