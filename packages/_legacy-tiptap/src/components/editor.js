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
	menuBubble,
	floatingMenu,
	builtInKeymap,
} from '../utils'
import builtInNodes from '../nodes'

export default {

	props: {
		doc: {
			type: Object,
			required: false,
			default: null,
		},
		extensions: {
			type: Array,
			required: false,
			default: () => [],
		},
		editable: {
			type: Boolean,
			default: true,
		},
		watchDoc: {
			type: Boolean,
			default: true,
		},
	},

	data() {
		const allExtensions = new ExtensionManager([
			...builtInNodes,
			...this.extensions,
		])
		const { nodes, marks, views } = allExtensions

		return {
			state: null,
			view: null,
			plugins: [],
			allExtensions,
			schema: null,
			nodes,
			marks,
			views,
			keymaps: [],
			commands: {},
			menuActions: null,
		}
	},

	watch: {

		doc: {
			deep: true,
			handler() {
				if (this.watchDoc) {
					this.setContent(this.doc, true)
				}
			},
		},

	},

	render(createElement) {
		const slots = []

		Object
			.entries(this.$scopedSlots)
			.forEach(([name, slot]) => {
				if (name === 'content') {
					this.contentNode = slot({})
					slots.push(this.contentNode)
				} else if (name === 'menubar') {
					this.menubarNode = slot({
						nodes: this.menuActions ? this.menuActions.nodes : null,
						marks: this.menuActions ? this.menuActions.marks : null,
						focused: this.view ? this.view.focused : false,
						focus: this.focus,
					})
					slots.push(this.menubarNode)
				} else if (name === 'menububble') {
					this.menububbleNode = slot({
						nodes: this.menuActions ? this.menuActions.nodes : null,
						marks: this.menuActions ? this.menuActions.marks : null,
						focused: this.view ? this.view.focused : false,
						focus: this.focus,
					})
					slots.push(this.menububbleNode)
				} else if (name === 'floatingMenu') {
					this.floatingMenuNode = slot({
						nodes: this.menuActions ? this.menuActions.nodes : null,
						marks: this.menuActions ? this.menuActions.marks : null,
						focused: this.view ? this.view.focused : false,
						focus: this.focus,
					})
					slots.push(this.floatingMenuNode)
				}
			})

		return createElement('div', {
			class: 'vue-editor',
		}, slots)
	},

	methods: {
		initEditor() {
			this.schema = this.createSchema()
			this.plugins = this.createPlugins()
			this.keymaps = this.createKeymaps()
			this.inputRules = this.createInputRules()
			this.state = this.createState()
			this.clearSlot()
			this.view = this.createView()
			this.commands = this.createCommands()
			this.updateMenuActions()
			this.$emit('init', {
				view: this.view,
				state: this.state,
			})
		},

		createSchema() {
			return new Schema({
				nodes: this.nodes,
				marks: this.marks,
			})
		},

		createPlugins() {
			return this.allExtensions.plugins
		},

		createKeymaps() {
			return this.allExtensions.keymaps({
				schema: this.schema,
			})
		},

		createInputRules() {
			return this.allExtensions.inputRules({
				schema: this.schema,
			})
		},

		createCommands() {
			return this.allExtensions.commands({
				schema: this.schema,
				view: this.view,
			})
		},

		createState() {
			return EditorState.create({
				schema: this.schema,
				doc: this.getDocument(),
				plugins: [
					...this.plugins,
					...this.getPlugins(),
				],
			})
		},

		getDocument() {
			if (this.doc) {
				return this.schema.nodeFromJSON(this.doc)
			}

			return DOMParser.fromSchema(this.schema).parse(this.contentNode.elm)
		},

		clearSlot() {
			this.contentNode.elm.innerHTML = ''
		},

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
						editable: () => this.editable,
					},
				}),
			]

			if (this.menububbleNode) {
				plugins.push(menuBubble(this.menububbleNode))
			}

			if (this.floatingMenuNode) {
				plugins.push(floatingMenu(this.floatingMenuNode))
			}

			return plugins
		},

		createView() {
			this.contentNode.elm.style.whiteSpace = 'pre-wrap'

			return new EditorView(this.contentNode.elm, {
				state: this.state,
				dispatchTransaction: this.dispatchTransaction,
				nodeViews: initNodeViews({
					nodes: this.views,
					editable: this.editable,
				}),
			})
		},

		destroyEditor() {
			if (this.view) {
				this.view.destroy()
			}
		},

		updateMenuActions() {
			this.menuActions = buildMenuActions({
				schema: this.schema,
				state: this.view.state,
				commands: this.commands,
			})
		},

		dispatchTransaction(transaction) {
			this.state = this.state.apply(transaction)
			this.view.updateState(this.state)
			this.updateMenuActions()

			if (!transaction.docChanged) {
				return
			}

			this.emitUpdate()
		},

		getHTML() {
			const div = document.createElement('div')
			const fragment = DOMSerializer
				.fromSchema(this.schema)
				.serializeFragment(this.state.doc.content)

			div.appendChild(fragment)

			return div.innerHTML
		},

		getJSON() {
			return this.state.doc.toJSON()
		},

		emitUpdate() {
			this.$emit('update', {
				getHTML: this.getHTML,
				getJSON: this.getJSON,
				state: this.state,
			})
		},

		getDocFromContent(content) {
			if (typeof content === 'object') {
				return this.schema.nodeFromJSON(content)
			}

			if (typeof content === 'string') {
				const element = document.createElement('div')
				element.innerHTML = content.trim()

				return DOMParser.fromSchema(this.schema).parse(element)
			}

			return false
		},

		setContent(content = {}, emitUpdate = false) {
			this.state = EditorState.create({
				schema: this.state.schema,
				doc: this.getDocFromContent(content),
				plugins: this.state.plugins,
			})

			this.view.updateState(this.state)

			if (emitUpdate) {
				this.emitUpdate()
			}
		},

		clearContent(emitUpdate = false) {
			this.setContent({
				type: 'doc',
				content: [{
					type: 'paragraph',
				}],
			}, emitUpdate)
		},

		focus() {
			this.view.focus()
		},

	},

	mounted() {
		this.initEditor()
	},

	beforeDestroy() {
		this.destroyEditor()
	},

}
