import { Plugin } from 'prosemirror-state'

class Menu {

	constructor({ options, editorView }) {
		this.options = {
			...{
				element: null,
				onUpdate: () => false,
			},
			...options,
		}
		this.editorView = editorView
		this.isActive = false
		this.top = 0

		this.editorView.dom.addEventListener('blur', this.hide.bind(this))
	}

	update(view, lastState) {
		const { state } = view

		// Don't do anything if the document/selection didn't change
		if (lastState && lastState.doc.eq(state.doc) && lastState.selection.eq(state.selection)) {
			return
		}

		if (!state.selection.empty) {
			this.hide()
			return
		}

		const currentDom = view.domAtPos(state.selection.$anchor.pos)

		const isActive = currentDom.node.innerHTML === '<br>'
			&& currentDom.node.tagName === 'P'
			&& currentDom.node.parentNode === view.dom

		if (!isActive) {
			this.hide()
			return
		}

		const editorBoundings = this.options.element.offsetParent.getBoundingClientRect()
		const cursorBoundings = view.coordsAtPos(state.selection.$anchor.pos)
		const top = cursorBoundings.top - editorBoundings.top

		this.isActive = true
		this.top = top

		this.sendUpdate()
	}

	sendUpdate() {
		this.options.onUpdate({
			isActive: this.isActive,
			top: this.top,
		})
	}

	hide(event) {
		if (event && event.relatedTarget) {
			return
		}

		this.isActive = false
		this.sendUpdate()
	}

	destroy() {
		this.editorView.dom.removeEventListener('blur', this.hide)
	}

}

export default function (options) {
	return new Plugin({
		view(editorView) {
			return new Menu({ editorView, options })
		},
	})
}
