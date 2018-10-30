import Vue from 'vue'
import { EditorState, Plugin } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { Schema, DOMParser, DOMSerializer } from 'prosemirror-model'
import { gapCursor } from 'prosemirror-gapcursor'
import { keymap } from 'prosemirror-keymap'
import { baseKeymap } from 'prosemirror-commands'
import { inputRules } from 'prosemirror-inputrules'
import { markIsActive, nodeIsActive, getMarkAttrs } from 'tiptap-utils'

import {
	ExtensionManager,
	initNodeViews,
	builtInKeymap,
} from '.'

import builtInNodes from '../Nodes'

export default class Editor {

	constructor(options = {}) {
		this.setOptions(options)
		this.init()
	}

	setOptions(options) {
		const defaultOptions = {
			editable: true,
			content: '',
			onUpdate: () => {},
		}

		this.options = {
			...defaultOptions,
			...options,
		}
	}

	init() {
		this.bus = new Vue()
		this.element = document.createElement('div')
		this.extensions = this.createExtensions()
		this.nodes = this.createNodes()
		this.marks = this.createMarks()
		this.views = this.createViews()
		this.schema = this.createSchema()
		this.plugins = this.createPlugins()
		this.keymaps = this.createKeymaps()
		this.inputRules = this.createInputRules()
		this.state = this.createState()
		this.view = this.createView()
		this.commands = this.createCommands()
		this.getActiveNodesAndMarks()
		this.emit('init')
	}

	createExtensions() {
		return new ExtensionManager([
			...builtInNodes,
			...this.options.extensions,
		])
	}

	createPlugins() {
		return this.extensions.plugins
	}

	createKeymaps() {
		return this.extensions.keymaps({
			schema: this.schema,
		})
	}

	createInputRules() {
		return this.extensions.inputRules({
			schema: this.schema,
		})
	}

	createCommands() {
		return this.extensions.commands({
			schema: this.schema,
			view: this.view,
			editable: this.options.editable,
		})
	}

	createNodes() {
		return this.extensions.nodes
	}

	createMarks() {
		return this.extensions.marks
	}

	createViews() {
		return this.extensions.views
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
			plugins: [
				...this.plugins,
				inputRules({
					rules: this.inputRules,
				}),
				...this.keymaps,
				keymap(builtInKeymap),
				keymap(baseKeymap),
				gapCursor(),
				new Plugin({
					props: {
						editable: () => this.options.editable,
					},
				}),
			],
		})
	}

	createDocument(content) {
		if (typeof content === 'object') {
			return this.schema.nodeFromJSON(content)
		}

		if (typeof content === 'string') {
			const element = document.createElement('div')
			element.innerHTML = content.trim()

			return DOMParser.fromSchema(this.schema).parse(element)
		}

		return false
	}

	createView() {
		const view = new EditorView(this.element, {
			state: this.state,
			dispatchTransaction: this.dispatchTransaction.bind(this),
			nodeViews: initNodeViews({
				nodes: this.views,
				editable: this.options.editable,
			}),
		})

		view.dom.style.whiteSpace = 'pre-wrap'

		return view
	}

	dispatchTransaction(transaction) {
		this.state = this.state.apply(transaction)
		this.view.updateState(this.state)
		this.getActiveNodesAndMarks()

		if (!transaction.docChanged) {
			return
		}

		this.emitUpdate()
	}

	emitUpdate() {
		this.options.onUpdate({
			getHTML: this.getHTML.bind(this),
			getJSON: this.getJSON.bind(this),
			state: this.state,
		})
	}

	getHTML() {
		const div = document.createElement('div')
		const fragment = DOMSerializer
			.fromSchema(this.schema)
			.serializeFragment(this.state.doc.content)

		div.appendChild(fragment)

		return div.innerHTML
	}

	getJSON() {
		return this.state.doc.toJSON()
	}

	setContent(content = {}, emitUpdate = false) {
		this.state = EditorState.create({
			schema: this.state.schema,
			doc: this.createDocument(content),
			plugins: this.state.plugins,
		})

		this.view.updateState(this.state)

		if (emitUpdate) {
			this.emitUpdate()
		}
	}

	clearContent(emitUpdate = false) {
		this.setContent({
			type: 'doc',
			content: [{
				type: 'paragraph',
			}],
		}, emitUpdate)
	}

	getActiveNodesAndMarks() {
		this.activeMarks = Object
			.entries(this.schema.marks)
			.reduce((marks, [name, mark]) => ({
				...marks,
				[name]: (attrs = {}) => markIsActive(this.state, mark, attrs),
			}), {})

		this.activeMarkAttrs = Object
			.entries(this.schema.marks)
			.reduce((marks, [name, mark]) => ({
				...marks,
				[name]: getMarkAttrs(this.state, mark),
			}), {})

		this.activeNodes = Object
			.entries(this.schema.nodes)
			.reduce((nodes, [name, node]) => ({
				...nodes,
				[name]: (attrs = {}) => nodeIsActive(this.state, node, attrs),
			}), {})
	}

	focus() {
		this.view.focus()
	}

	emit(event, ...data) {
		this.bus.$emit(event, ...data)
	}

	on(event, callback) {
		this.bus.$on(event, callback)
	}

	registerPlugin(plugin = null) {
		if (plugin) {
			this.state = this.state.reconfigure({
				plugins: this.state.plugins.concat([plugin]),
			})
			this.view.updateState(this.state)
		}
	}

	markAttrs(type = null) {
		return this.activeMarkAttrs[type]
	}

	isActive(type = null, attrs = {}) {
		const types = {
			...this.activeMarks,
			...this.activeNodes,
		}

		if (!types[type]) {
			return false
		}

		return types[type](attrs)
	}

	destroy() {
		this.emit('destroy')

		if (this.view) {
			this.view.destroy()
		}
	}

}
