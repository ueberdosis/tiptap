import { Mark } from 'tiptap'
import { toggleMark, markInputRule } from 'tiptap-commands'

export default class BoldMark extends Mark {

	get name() {
		return 'bold'
	}

	get schema() {
		return {
			parseDOM: [
				{
					tag: 'strong',
				},
				{
					tag: 'b',
					getAttrs: node => node.style.fontWeight !== 'normal' && null,
				},
				{
					style: 'font-weight',
					getAttrs: value => /^(bold(er)?|[5-9]\d{2,})$/.test(value) && null,
				},
			],
			toDOM: () => ['strong', 0],
		}
	}

	keys({ type }) {
		return {
			'Mod-b': toggleMark(type),
		}
	}

	command({ type }) {
		return toggleMark(type)
	}

	inputRules({ type }) {
		return [
			markInputRule(/(?:\*\*|__)([^*_]+)(?:\*\*|__)$/, type),
		]
	}

}
