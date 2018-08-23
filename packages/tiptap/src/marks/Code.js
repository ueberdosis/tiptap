import { Mark } from '../utils'
import { toggleMark } from 'tiptap-commands'

export default class CodeMark extends Mark {

	get name() {
		return 'code'
	}

	get schema() {
		return {
			parseDOM: [
				{ tag: 'code' },
			],
			toDOM: () => ['code', 0],
		}
	}

	keys({ type }) {
		return {
			'Mod-`': toggleMark(type),
		}
	}

	command({ type }) {
		return toggleMark(type)
	}

}
