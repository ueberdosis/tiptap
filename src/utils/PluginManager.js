import { keymap } from 'prosemirror-keymap'

export default class PluginManager {

	constructor(plugins = []) {
		this.plugins = plugins
	}

	get nodes() {
		return this.plugins
			.filter(plugin => plugin.type === 'node')
			.reduce((nodes, { name, schema }) => ({
				...nodes,
				[name]: schema,
			}), {})
	}

	get marks() {
		return this.plugins
			.filter(plugin => plugin.type === 'mark')
			.reduce((marks, { name, schema }) => ({
				...marks,
				[name]: schema,
			}), {})
	}

	get pluginplugins() {
		return this.plugins
			.filter(plugin => plugin.plugins)
			.reduce((allPlugins, { plugins }) => ([
				...allPlugins,
				...plugins,
			]), [])
	}

	get views() {
		return this.plugins
			.filter(plugin => plugin.view)
			.reduce((views, { name, view }) => ({
				...views,
				[name]: view,
			}), {})
	}

	keymaps({ schema }) {
		return this.plugins
			.filter(plugin => plugin.keys)
			.map(plugin => plugin.keys({
				type: schema[`${plugin.type}s`][plugin.name],
				schema,
			}))
			.map(keys => keymap(keys))
	}

	inputRules({ schema }) {
		return this.plugins
			.filter(plugin => plugin.inputRules)
			.map(plugin => plugin.inputRules({
				type: schema[`${plugin.type}s`][plugin.name],
				schema,
			}))
			.reduce((allInputRules, inputRules) => ([
				...allInputRules,
				...inputRules,
			]), [])
	}

	commands({ schema, view }) {
		return this.plugins
			.filter(plugin => plugin.command)
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
