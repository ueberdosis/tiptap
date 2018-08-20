import { Node } from 'vue-mirror/utils'

export default class MentionNode extends Node {

	get name() {
		return 'mention'
	}

	get schema() {
		return {
			attrs: {
				id: {
					default: null,
				},
			},
			group: 'inline',
			inline: true,
			draggable: true,
			toDOM: node => [
				'span',
				{
					dataId: node.attrs.id,
					class: 'mention',
				},
				`@${node.attrs.id}`,
			],
		}
	}

}
