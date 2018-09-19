import { Extension, Plugin } from 'tiptap'
import { Decoration, DecorationSet } from 'prosemirror-view'
import { NodeSelection, PluginKey } from 'prosemirror-state'

export default class AlignmentExtension extends Extension {

	get name() {
		return 'alignment'
	}
	//
	// get defaultOptions() {
	// 	return {
	// 		alignmentClass: '',
	// 	}
	// }

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
				// state: {
				// 	init({ doc, selection }) { return {} }
				// 	apply(tr, value) { return value }
				// }
				// appendTransaction(transactions, old, { doc, selection, tr }) {
				// 	tr.
				// }
				filterTransaction(transaction, { doc, selection, tr }) {
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
					// tr.setMeta('selectedBlockPositions', nodes)
					return true
				},
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
