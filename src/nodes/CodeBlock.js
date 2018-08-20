import { Node } from 'tiptap/utils'
import { toggleBlockType, setBlockType, textblockTypeInputRule } from 'tiptap/helpers'

export default class CodeBlockNode extends Node {

	get name() {
		return 'code_block'
	}

	get schema() {
		return {
			content: 'text*',
			marks: '',
			group: 'block',
			code: true,
			defining: true,
			draggable: false,
			parseDOM: [
				{ tag: 'pre', preserveWhitespace: 'full' },
			],
			toDOM: () => ['pre', ['code', 0]],
		}
	}

	command({ type, schema }) {
		return toggleBlockType(type, schema.nodes.paragraph)
	}

	keys({ type }) {
		return {
			'Shift-Ctrl-\\': setBlockType(type),
		}
	}

	inputRules({ type }) {
		return [
			textblockTypeInputRule(/^```$/, type),
		]
	}

}
