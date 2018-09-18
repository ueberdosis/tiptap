import { Extension, Plugin } from 'tiptap'
import { Decoration, DecorationSet } from 'prosemirror-view'
import { NodeSelection, PluginKey } from 'prosemirror-state'
import { Transaction } from 'prosemirror-transform'

export default class AlignmentExtension extends Extension {

	get name() {
		return 'alignment'
	}

	get defaultOptions() {
		return {
			alignmentClass: '',
		}
	}

	get plugins() {
		function getSelectionObject ({ $anchor, $head }) {
			return {
				from: $anchor.pos <= $head.pos ? $anchor.parent : $head.parent,
				to: $head.pos > $anchor.pos ? $head.parent : $anchor.parent,
				fromFound: false,
				toFound: false
			}
		}

		return [
			new Plugin({
				key: new PluginKey('alignment'),
				state: {
					init({ doc, selection }) {
						if (selection) {
							let { from, to, fromFound, toFound } =
								getSelectionObject(selection)
							const nodes = []
							doc.descendants((node, pos) => {
								if (!node.isInline && (node === from || (fromFound && !toFound))) {
									nodes.push({ from: pos, to: pos + node.nodeSize })
									// decorations.push(
									// 	Decoration.node(pos, pos + node.nodeSize, {
									// 		class: 'SANDWICH',
									// 	}))
									// console.log('NOW ', anchor === head)

									fromFound = true
								}
								toFound = toFound || (from === to || node === to)
							})
							return nodes
						} else return {}
					},
					apply(tr, value) { return value }
				},
				// filterTransaction(transactions, { doc, selection }) {
				// 	//
				// 	// console.log(nodes)
				// 	// new Transaction
				// 	// // debugger
				// 	// console.log(tr.getMeta('selectedBlockPositions'))
				// 	// tr.setMeta('selectedBlockPositions', nodes)
				// 	return true
				// },
				// props: {
				// 	decorations ({ apply, doc, selection, tr }) {
				//
				// 		// apply(new Transaction({ meta: }) tr.setMeta('selectedBlockPositions', nodes))
				//
				// 		// return DecorationSet.create(doc, decorations)
				// 	}
				//
				// },
			}),
		]
	}

}
