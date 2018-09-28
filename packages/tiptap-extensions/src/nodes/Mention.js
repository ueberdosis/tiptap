import { Node } from 'tiptap'
import { replaceText } from 'tiptap-commands'
import { triggerCharacter, suggestionsPlugin } from '../plugins/suggestions'

export default class MentionNode extends Node {

	get name() {
		return 'mention'
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
						const label = dom.innerText.split('@').join('')
						return { type, id, label }
					},
				},
			],
		}
	}

	get plugins() {
		return [
			suggestionsPlugin({
				suggestionClass: 'mention-suggestion',
				matcher: triggerCharacter('@', {
					allowSpaces: false,
					startOfLine: false,
				}),
				command: ({ pos, attrs, schema }) => {
					return replaceText(pos, schema.nodes.mention, attrs)
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
