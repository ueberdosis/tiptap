import { Node } from 'tiptap'
import { setInlineBlockType } from 'tiptap-commands'
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
						const label = dom.innerText
						return { type, id, label }
					},
				},
			],
		}
	}

	command({ type, attrs }) {
		return setInlineBlockType(type, attrs)
	}

	get plugins() {
		return [
			suggestionsPlugin({
				debug: true,
				matcher: triggerCharacter('@', {
					allowSpaces: true,
					startOfLine: false,
				}),
				onEnter: this.options.onEnter,
				onChange: this.options.onChange,
				onExit: this.options.onExit,
				onKeyDown: this.options.onKeyDown,
			}),
		]
	}

}
