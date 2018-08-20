import { Mark } from 'tiptap/utils'
import { toggleMark } from 'tiptap/helpers'

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
