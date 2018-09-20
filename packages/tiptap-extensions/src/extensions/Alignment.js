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

	selectionObject ({ $anchor, $head }) {
		return {
			from: $anchor.pos <= $head.pos ? $anchor.parent : $head.parent,
			to: $head.pos > $anchor.pos ? $head.parent : $anchor.parent,
			fromFound: false,
			toFound: false
		}
	}

	decorate ({ doc, selection, decorations = [] }, view = null) {
		let { from, to, fromFound, toFound } = this.selectionObject(selection)
		doc.descendants((node, pos) => {
			if (!node.isInline && (node === from || (fromFound && !toFound))) {
				decorations.push(
					Decoration.node(pos, pos + node.nodeSize, {
						class: this.options.alignmentClass,
					}))
					if (view) {
						view.docView.update(node, [decorations[decorations.length -1]])
					}
				fromFound = true
			}
			this.options.alignmentClass = ''
			toFound = toFound || (from === to || node === to)
		})
		return DecorationSet.create(doc, decorations)
	}

	get plugins() {
		const plugin = new Plugin({
			state: {
		    init: (_, eventState) => this.decorate(eventState),
		    apply: (tr, set) => {
					return this.decorate({ doc: tr.doc, selection: tr.curSelection })
				}
		  },
			key: new PluginKey('alignment'),
			props: {
				// decorations(state) { return plugin.getState(state) }
			},
		})
		return [plugin]
	}

}
