import { Node } from 'vue-mirror/utils'
import { splitListItem, liftListItem, sinkListItem } from 'vue-mirror/helpers'

export default class OrderedListNode extends Node {

	get name() {
		return 'list_item'
	}

	get schema() {
		return {
			content: 'paragraph block*',
			group: 'block',
			defining: true,
			draggable: false,
			parseDOM: [
				{ tag: 'li' },
			],
			toDOM: () => ['li', 0],
		}
	}

	keys({ type }) {
		return {
			Enter: splitListItem(type),
			Tab: sinkListItem(type),
			'Shift-Tab': liftListItem(type),
		}
	}

}
