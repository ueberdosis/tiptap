import { keymap } from 'prosemirror-keymap'

export default class ExtensionManager {

	constructor(extensions = []) {
		this.extensions = extensions
	}

	get nodes() {
		return this.extensions
			.filter(extension => extension.type === 'node')
			.reduce((nodes, { name, schema }) => ({
				...nodes,
				[name]: schema,
			}), {})
	}

	get marks() {
		return this.extensions
			.filter(extension => extension.type === 'mark')
			.reduce((marks, { name, schema }) => ({
				...marks,
				[name]: schema,
			}), {})
	}

	get plugins() {
		return this.extensions
			.filter(extension => extension.plugins)
			.reduce((allPlugins, { plugins }) => ([
				...allPlugins,
				...plugins,
			]), [])
	}

	get views() {
		return this.extensions
			.filter(extension => extension.view)
			.reduce((views, { name, view }) => ({
				...views,
				[name]: view,
			}), {})
	}

	keymaps({ schema }) {
		return this.extensions
			.filter(extension => extension.keys)
			.map(extension => extension.keys({
				type: schema[`${extension.type}s`][extension.name],
				schema,
			}))
			.map(keys => keymap(keys))
	}

	inputRules({ schema }) {
		return this.extensions
			.filter(extension => extension.inputRules)
			.map(extension => extension.inputRules({
				type: schema[`${extension.type}s`][extension.name],
				schema,
			}))
			.reduce((allInputRules, inputRules) => ([
				...allInputRules,
				...inputRules,
			]), [])
	}

	commands({ schema, view }) {
		return this.extensions
			.filter(extension => extension.command)
			.reduce((commands, { name, type, command }) => ({
				...commands,
				[name]: attrs => {
					view.focus()
					command({
						type: schema[`${type}s`][name],
						attrs,
						schema,
					})(view.state, view.dispatch, view)
				},
			}), {})
	}

}
