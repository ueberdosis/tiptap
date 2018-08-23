import { Node } from '../utils'
import { setBlockType, textblockTypeInputRule, toggleBlockType } from '../helpers'

export default class HeadingNode extends Node {

	get name() {
		return 'heading'
	}

	get defaultOptions() {
		return {
			maxLevel: 6,
		}
	}

	get levels() {
		return Array.from(new Array(this.options.maxLevel), (value, index) => index + 1)
	}

	get schema() {
		return {
			attrs: {
				level: {
					default: 1,
				},
			},
			content: 'inline*',
			group: 'block',
			defining: true,
			draggable: false,
			parseDOM: this.levels.map(level => ({ tag: `h${level}`, attrs: { level } })),
			toDOM: node => [`h${node.attrs.level}`, 0],
		}
	}

	command({ type, schema, attrs }) {
		return toggleBlockType(type, schema.nodes.paragraph, attrs)
	}

	keys({ type }) {
		return this.levels.reduce((items, level) => ({
			...items,
			...{
				[`Shift-Ctrl-${level}`]: setBlockType(type, { level }),
			},
		}), {})
	}

	inputRules({ type }) {
		return [
			textblockTypeInputRule(
				new RegExp(`^(#{1,${this.options.maxLevel}})\\s$`),
				type,
				match => ({ level: match[1].length }),
			),
		]
	}

}
