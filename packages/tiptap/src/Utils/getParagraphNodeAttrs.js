import { ALIGN_PATTERN } from './alignment'

export default function getParagraphNodeAttrs(dom) {
  const {
    textAlign,
  } = dom.style
  const attrs = {}

  const align = dom.getAttribute('align') || textAlign || ''
  if (align && ALIGN_PATTERN.test(align)) {
    attrs.align = align
  }

  return attrs
}
