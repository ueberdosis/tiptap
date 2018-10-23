import Vue from 'vue'
import { EditorState, Plugin } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { Schema, DOMParser, DOMSerializer } from 'prosemirror-model'
import { gapCursor } from 'prosemirror-gapcursor'
import { keymap } from 'prosemirror-keymap'
import { baseKeymap } from 'prosemirror-commands'
import { inputRules } from 'prosemirror-inputrules'

import {
	buildMenuActions,
	ExtensionManager,
	initNodeViews,
	// menuBubble,
	// floatingMenu,
	builtInKeymap,
} from '../Utils'

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
		this.updateMenuActions()

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
				...this.getPlugins(),
			],
		})
	}

	getPlugins() {
		const plugins = [
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
		]

		// if (this.menububbleNode) {
		// 	plugins.push(menuBubble(this.menububbleNode))
		// }

		// if (this.floatingMenuNode) {
		// 	plugins.push(floatingMenu(this.floatingMenuNode))
		// }

		return plugins
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
		this.updateMenuActions()

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

	updateMenuActions() {
		this.menuActions = buildMenuActions({
			editable: this.options.editable,
			schema: this.schema,
			state: this.view.state,
			commands: this.commands,
		})
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
			this.plugins = this.plugins.concat([plugin])
			this.state = this.state.reconfigure({
				plugins: this.plugins,
			})
			this.view.updateState(this.state)
		}
	}

	destroy() {
		this.emit('destroy')

		if (this.view) {
			this.view.destroy()
		}
	}

}