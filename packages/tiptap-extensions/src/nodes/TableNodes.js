import { tableNodes } from 'prosemirror-tables'

const Table = tableNodes({
	tableGroup: 'block',
	cellContent: 'block+',
	cellAttributes: {
		background: {
			default: null,
			getFromDOM(dom) { return dom.style.backgroundColor || null },
			setDOMAttr(value, attrs) {
				if (value) {
          const style = { style: `${(attrs.style || '')}background-color: ${value};` }
          Object.assign(attrs, style)
        }
			},
		},
	},
})
export default Table
