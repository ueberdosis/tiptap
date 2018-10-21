import Vue from 'vue'
import { EditorState, Plugin } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { Schema, DOMParser, DOMSerializer } from 'prosemirror-model'
import { gapCursor } from 'prosemirror-gapcursor'
import { keymap } from 'prosemirror-keymap'
import { baseKeymap } from 'prosemirror-commands'
import { inputRules } from 'prosemirror-inputrules'

import {
	// buildMenuActions,
	ExtensionManager,
	// initNodeViews,
	// menuBubble,
	// floatingMenu,
	// builtInKeymap,
} from '../Utils'

import builtInNodes from '../Nodes'

export default class Editor {

	constructor(options = {}) {
		console.log('construct editor')

		this.element = document.createElement('div')
		this.bus = new Vue()

		this.options = options
		this.extensions = this.createExtensions()
		this.nodes = this.createNodes()
		this.marks = this.createMarks()
		this.schema = this.createSchema()
		this.state = this.createState()
		this.view = this.createView()

		console.log('emit init')
		this.emit('init')

		console.log(this.view)
	}

	createExtensions() {
		return new ExtensionManager([
			...builtInNodes,
			...this.options.extensions,
		])
	}

	createNodes() {
		const { nodes } = this.extensions
		return nodes
	}

	createMarks() {
		return []
	}

	createSchema() {
		return new Schema({
			nodes: this.nodes,
			marks: this.marks,
		})
	}

	createState() {
		return EditorState.create({
			schema: this.schema,
			doc: this.createDocument(this.options.content),
		})
	}

	createDocument(content) {
		if (typeof content === 'object') {
			return this.schema.nodeFromJSON(content)
		}

		// return DOMParser.fromSchema(this.schema).parse(this.contentNode.elm)
	}

	createView() {
		this.element.style.whiteSpace = 'pre-wrap'

		return new EditorView(this.element, {
			state: this.state,
			dispatchTransaction: this.dispatchTransaction.bind(this),
			// nodeViews: initNodeViews({
			// 	nodes: this.views,
			// 	editable: this.editable,
			// }),
		})
	}

	dispatchTransaction(transaction) {
		this.state = this.state.apply(transaction)
		this.view.updateState(this.state)
		// this.updateMenuActions()

		if (!transaction.docChanged) {
			return
		}

		this.emitUpdate()
	}

	emitUpdate() {
		console.log(this.getHTML())
		// this.$emit('update', {
		// 	getHTML: this.getHTML,
		// 	getJSON: this.getJSON,
		// 	state: this.state,
		// })
	}

	getHTML() {
		const div = document.createElement('div')
		const fragment = DOMSerializer
			.fromSchema(this.schema)
			.serializeFragment(this.state.doc.content)

		div.appendChild(fragment)

		return div.innerHTML
	}

	emit(event, ...data) {
		this.bus.$emit(event, ...data)
	}

	on(event, callback) {
		this.bus.$on(event, callback)
	}

}