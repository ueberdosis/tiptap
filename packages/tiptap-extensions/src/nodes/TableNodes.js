import { tableNodes } from 'prosemirror-tables'
import { ALIGN_PATTERN } from 'tiptap'

export default tableNodes({
  tableGroup: 'block',
  cellContent: 'block+',
  cellAttributes: {
    align: {
      default: null,
      getFromDOM(dom) {
        const { textAlign = null } = dom.style
        const align = dom.getAttribute('align') || textAlign || ''

        return align && ALIGN_PATTERN.test(align)
          ? align
          : null
      },
      setDOMAttr(value, attrs) {
        if (!value) {
          return
        }

        const style = { style: `${(attrs.style || '')}text-align: ${value};` }
        Object.assign(attrs, style)
      },
    },
    background: {
      default: null,
      getFromDOM(dom) {
        return dom.style.backgroundColor || null
      },
      setDOMAttr(value, attrs) {
        if (value) {
          const style = { style: `${(attrs.style || '')}background-color: ${value};` }
          Object.assign(attrs, style)
        }
      },
    },
  },
})
