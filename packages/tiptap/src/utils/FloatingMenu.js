import { Plugin } from 'prosemirror-state'

class Toolbar {

	constructor({ element, editorView }) {
		this.editorView = editorView
		this.element = element
		this.element.style.visibility = 'hidden'
		this.element.style.opacity = 0

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
			// && currentDom.node.parentNode === view.dom

		if (!isActive) {
			this.hide()
			return
		}

		const editorBoundings = this.element.offsetParent.getBoundingClientRect()
		const cursorBoundings = view.coordsAtPos(state.selection.$anchor.pos)
		const top = cursorBoundings.top - editorBoundings.top

		this.element.style.top = `${top}px`
		this.show()
	}

	show() {
		this.element.style.visibility = 'visible'
		this.element.style.opacity = 1
	}

	hide(event) {
		if (event && event.relatedTarget) {
			return
		}

		this.element.style.visibility = 'hidden'
		this.element.style.opacity = 0
	}

	destroy() {
		this.editorView.dom.removeEventListener('blur', this.hide)
	}

}

export default function (element) {
	return new Plugin({
		view(editorView) {
			return new Toolbar({ editorView, element })
		},
	})
}
