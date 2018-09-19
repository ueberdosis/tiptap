import { Extension, Plugin } from 'tiptap'
import { Decoration, DecorationSet } from 'prosemirror-view'
import { NodeSelection, PluginKey } from 'prosemirror-state'
import align from '../events/align.js'
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
				state: {
			    init(_, {doc}) { return '' },
			    apply(tr, old) { return tr.alignment }
			  },
				key: new PluginKey('alignment'),
				// filterTransaction(transaction, { doc, selection, tr }) {
				// 	let { from, to, fromFound, toFound } =
				// 		getSelectionObject(selection)
				// 	const nodes = []
				// 	doc.descendants((node, pos) => {
				// 		if (!node.isInline && (node === from || (fromFound && !toFound))) {
				// 			nodes.push({ from: pos, to: pos + node.nodeSize })
				// 			fromFound = true
				// 		}
				// 		toFound = toFound || (from === to || node === to)
				// 	})
				// 	return true
				// },
				props: {
					decorations ({ apply, doc, selection, tr }, alignment = '') {
						let { from, to, fromFound, toFound } =
							getSelectionObject(selection)
						const decorations = []
						doc.descendants(function (node, pos) {
							if (!node.isInline && (node === from || (fromFound && !toFound))) {
								decorations.push(
									Decoration.node(pos, pos + node.nodeSize, {
										class: this.options.alignmentClass,
									}))
								fromFound = true
							}
							toFound = toFound || (from === to || node === to)
						}.bind(this))
						console.log(this.options.alignmentClass)
						return DecorationSet.create(doc, decorations)
					}

				},
			}),
		]
	}

}
