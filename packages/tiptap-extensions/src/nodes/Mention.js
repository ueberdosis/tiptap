import { Node } from 'tiptap'
import { triggerCharacter, suggestionsPlugin } from '../plugins/suggestions'

export default class BlockquoteNode extends Node {

	get name() {
		return 'blockquote'
	}

	get schema() {
		return {
			attrs: {
				type: {},
				id: {},
				label: {},
			},
			group: 'inline',
			inline: true,
			selectable: false,
			atom: true,
			toDOM: node => [
				'span',
				{
					class: 'mention',
					'data-mention-type': node.attrs.type,
					'data-mention-id': node.attrs.id,
				},
				`@${node.attrs.label}`,
			],
			parseDOM: [
				{
					tag: 'span[data-mention-type][data-mention-id]',
					getAttrs: dom => {
						const type = dom.getAttribute('data-mention-type')
						const id = dom.getAttribute('data-mention-id')
						const label = dom.innerText
						return { type, id, label }
					},
				},
			],
		}
	}

	get plugins() {
		return [
			suggestionsPlugin({
				debug: true,
				matcher: triggerCharacter('@', { allowSpaces: false }),
				onEnter(args) {
					console.log('start', args);
				},
				onChange(args) {
					console.log('change', args);
				},
				onExit(args) {
					console.log('stop', args);
				},
				onKeyDown({ view, event }) {
					// console.log(event.key);
					return false;
				},
			}),
		]
	}

}
