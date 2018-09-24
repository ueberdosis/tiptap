import { Mark } from 'tiptap'
import { updateMark, removeMark } from 'tiptap-commands'

export default class LinkMark extends Mark {

	get name() {
		return 'link'
	}

	get schema() {
		return {
			attrs: {
				href: {
					default: null,
				},
			},
			inclusive: false,
			parseDOM: [
				{
					tag: 'a[href]',
					getAttrs: dom => ({
						href: dom.getAttribute('href'),
					}),
				},
			],
			toDOM: node => ['a', {
				...node.attrs,
				rel: 'noopener noreferrer nofollow',
			}, 0],
		}
	}

	command({ type, attrs }) {
		if (attrs.href) {
			return updateMark(type, attrs)
		}

		return removeMark(type)
	}

}
