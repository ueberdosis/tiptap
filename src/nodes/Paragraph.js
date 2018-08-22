import { Node } from '../utils'
import { setBlockType } from '../helpers'

export default class ParagraphNode extends Node {

	get name() {
		return 'paragraph'
	}

	get schema() {
		return {
			content: 'inline*',
			group: 'block',
			draggable: false,
			parseDOM: [{
				tag: 'p',
			}],
			toDOM: () => ['p', 0],
		}
	}

	command({ type }) {
		return setBlockType(type)
	}

	keys({ type }) {
		return {
			'Shift-Ctrl-0': setBlockType(type),
		}
	}

}
