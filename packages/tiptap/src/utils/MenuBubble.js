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

		// Hide the tooltip if the selection is empty
		if (state.selection.empty) {
			this.hide()
			return
		}

		// Otherwise, reposition it and update its content
		this.show()
		const { from, to } = state.selection

		// These are in screen coordinates
		const start = view.coordsAtPos(from)
		const end = view.coordsAtPos(to)

		// The box in which the tooltip is positioned, to use as base
		const box = this.element.offsetParent.getBoundingClientRect()

		// Find a center-ish x position from the selection endpoints (when
		// crossing lines, end may be more to the left)
		const left = Math.max((start.left + end.left) / 2, start.left + 3)
		this.element.style.left = `${left - box.left}px`
		this.element.style.bottom = `${box.bottom - start.top}px`
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
