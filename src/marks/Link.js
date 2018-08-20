import { Mark } from 'vue-mirror/utils'
import { updateMark, removeMark } from 'vue-mirror/helpers'

export default class LinkMark extends Mark {

	get name() {
		return 'link'
	}

	get view() {
		return {
			props: ['node'],
			methods: {
				onClick() {
					console.log('click on link')
				},
			},
			template: `
				<a :href="node.attrs.href" rel="noopener noreferrer nofollow" ref="content" @click="onClick"></a>
			`,
		}
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
