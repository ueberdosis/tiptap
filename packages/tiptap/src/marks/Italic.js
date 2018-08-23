import { Mark } from '../utils'
import { toggleMark } from 'tiptap-commands'

export default class ItalicMark extends Mark {

	get name() {
		return 'italic'
	}

	get schema() {
		return {
			parseDOM: [
				{ tag: 'i' },
				{ tag: 'em' },
				{ style: 'font-style=italic' },
			],
			toDOM: () => ['em', 0],
		}
	}

	keys({ type }) {
		return {
			'Mod-i': toggleMark(type),
		}
	}

	command({ type }) {
		return toggleMark(type)
	}

}
