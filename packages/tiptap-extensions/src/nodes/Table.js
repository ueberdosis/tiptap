import { Node } from 'tiptap'
import { createTable } from 'prosemirror-utils'

export default class TableNodes extends Node {

	get name() {
		return 'table'
	}

	get schema() {
		return {
			inline: true,
			attrs: {
				src: {},
				alt: {
					default: null,
				},
				title: {
					default: null,
				},
			},
			group: 'inline',
			draggable: true,
			parseDOM: [
				{
					tag: 'img[src]',
					getAttrs: dom => ({
						src: dom.getAttribute('src'),
						title: dom.getAttribute('title'),
						alt: dom.getAttribute('alt'),
					}),
				},
			],
			toDOM: node => ['img', node.attrs],
		}
	}

}
