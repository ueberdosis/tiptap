import { Node } from 'tiptap'
import { replaceText } from 'tiptap-commands'
import { suggestionsPlugin } from '../plugins/suggestions'

export default class MentionNode extends Node {

	get name() {
		return 'mention'
	}

	get schema() {
		return {
			attrs: {
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
					'data-mention-id': node.attrs.id,
				},
				`@${node.attrs.label}`,
			],
			parseDOM: [
				{
					tag: 'span[data-mention-id]',
					getAttrs: dom => {
						const id = dom.getAttribute('data-mention-id')
						const label = dom.innerText.split('@').join('')
						return { id, label }
					},
				},
			],
		}
	}

	get plugins() {
		return [
			suggestionsPlugin({
				suggestionClass: 'mention-suggestion',
				matcher: {
					char: '@',
					allowSpaces: false,
					startOfLine: false,
				},
				command: ({ position, attrs, schema }) => {
					return replaceText(position, schema.nodes.mention, attrs)
				},
				items: this.options.items,
				onEnter: this.options.onEnter,
				onChange: this.options.onChange,
				onExit: this.options.onExit,
				onKeyDown: this.options.onKeyDown,
				onFilter: this.options.onFilter,
			}),
		]
	}

}
