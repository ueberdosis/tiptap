import { Mark } from 'tiptap'
import { toggleMark, markInputRule } from 'tiptap-commands'

export default class StrikeMark extends Mark {

	get name() {
		return 'strike'
	}

	get schema() {
		return {
			parseDOM: [
				{
					tag: 's',
				},
				{
					tag: 'del',
				},
				{
					tag: 'strike',
				},
				{
					style: 'text-decoration',
					getAttrs: value => value === 'line-through',
				},
			],
			toDOM: () => ['s', 0],
		}
	}

	keys({ type }) {
		return {
			'Mod-d': toggleMark(type),
		}
	}

	command({ type }) {
		return toggleMark(type)
	}

	inputRules({ type }) {
		return [
			markInputRule(/~([^~]+)~$/, type),
		]
	}

}
