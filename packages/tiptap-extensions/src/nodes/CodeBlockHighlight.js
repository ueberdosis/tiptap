import { Node, Plugin } from 'tiptap'
import { Decoration, DecorationSet } from 'prosemirror-view'
import { toggleBlockType, setBlockType, textblockTypeInputRule } from 'tiptap-commands'
import { findBlockNodes } from 'prosemirror-utils'
import low from 'lowlight'

export default class CodeBlockHighlightNode extends Node {

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

	get plugins() {
		return [
			new Plugin({
				props: {
					decorations({ doc }) {
						const decorations = []

						const blocks = findBlockNodes(doc)
							.filter(item => item.node.type.name === 'code_block')

						const flatten = list => list.reduce(
								(a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), []
						)

						function parseNodes(nodes, className = []) {
							return nodes.map(node => {

								const classes = [
									...className,
									...node.properties ? node.properties.className : [],
								]

								if (node.children) {
									return parseNodes(node.children, classes)
								}

								return {
									text: node.value,
									classes,
								}
							})
						}

						blocks.forEach(block => {
							let startPos = block.pos + 1
							const nodes = low.highlightAuto(block.node.textContent).value

							flatten(parseNodes(nodes))
								.map(node => {
									const from = startPos
									const to = from + node.text.length

									startPos = to

									return {
										...node,
										from,
										to,
									}
								})
								.forEach(node => {
									const decoration = Decoration.inline(node.from, node.to, {
										class: node.classes.join(' '),
									})
									decorations.push(decoration)
								})
						})

						return DecorationSet.create(doc, decorations)
					},
				},
			}),
		]
	}

}
