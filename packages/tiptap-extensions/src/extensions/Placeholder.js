import { Extension, Plugin } from 'tiptap'
import { Decoration, DecorationSet } from 'prosemirror-view'

export default class PlaceholderExtension extends Extension {

	get name() {
		return 'placeholder'
	}

	get defaultOptions() {
		return {
			emptyNodeClass: 'is-empty',
		}
	}

	get plugins() {
		return [
			new Plugin({
				props: {
					decorations: state => {
						const decorations = []

						state.doc.descendants((node, pos) => {
							if (node.type.isBlock && node.childCount === 0) {
								const decoration = Decoration.node(pos, pos + node.nodeSize, {
									class: this.options.emptyNodeClass,
								})
								decorations.push(decoration)
							}
						})

						return DecorationSet.create(state.doc, decorations)
					},
				},
			}),
		]
	}

}
