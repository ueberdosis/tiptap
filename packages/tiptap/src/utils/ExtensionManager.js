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
			.filter(extension => ['node', 'mark'].includes(extension.type))
			.filter(extension => extension.view)
			.reduce((views, { name, view }) => ({
				...views,
				[name]: view,
			}), {})
	}

	keymaps({ schema }) {
		const extensionKeymaps = this.extensions
			.filter(extension => ['extension'].includes(extension.type))
			.filter(extension => extension.keys)
			.map(extension => extension.keys({ schema }))

		const nodeMarkKeymaps = this.extensions
			.filter(extension => ['node', 'mark'].includes(extension.type))
			.filter(extension => extension.keys)
			.map(extension => extension.keys({
				type: schema[`${extension.type}s`][extension.name],
				schema,
			}))

		return [
			...extensionKeymaps,
			...nodeMarkKeymaps,
		].map(keys => keymap(keys))
	}

	inputRules({ schema }) {
		const extensionInputRules = this.extensions
			.filter(extension => ['extension'].includes(extension.type))
			.filter(extension => extension.inputRules)
			.map(extension => extension.inputRules({ schema }))

		const nodeMarkInputRules = this.extensions
			.filter(extension => ['node', 'mark'].includes(extension.type))
			.filter(extension => extension.inputRules)
			.map(extension => extension.inputRules({
				type: schema[`${extension.type}s`][extension.name],
				schema,
			}))

		return [
			...extensionInputRules,
			...nodeMarkInputRules,
		].reduce((allInputRules, inputRules) => ([
			...allInputRules,
			...inputRules,
		]), [])
	}

	commands({ schema, view, editable }) {
		return this.extensions
			.filter(extension => extension.commands)
			.reduce((allCommands, { name, type, commands: provider }) => {

				const commands = {}
				const value = provider({
					schema,
					...['node', 'mark'].includes(type) ? {
						type: schema[`${type}s`][name],
					} : {},
				})

				if (Array.isArray(value)) {
					commands[name] = attrs => value
						.forEach(callback => {
							if (!editable) {
								return false
							}
							view.focus()
							return callback(attrs)(view.state, view.dispatch, view)
						})
				} else if (typeof value === 'function') {
					commands[name] = attrs => {
						if (!editable) {
							return false
						}
						view.focus()
						return value(attrs)(view.state, view.dispatch, view)
					}
				} else if (typeof value === 'object') {
					Object.entries(value).forEach(([commandName, commandValue]) => {
						if (Array.isArray(commandValue)) {
							commands[commandName] = attrs => commandValue
								.forEach(callback => {
									if (!editable) {
										return false
									}
									view.focus()
									return callback(attrs)(view.state, view.dispatch, view)
								})
						} else {
							commands[commandName] = attrs => {
								if (!editable) {
									return false
								}
								view.focus()
								return commandValue(attrs)(view.state, view.dispatch, view)
							}
						}
					})
				}

				return {
					...allCommands,
					...commands,
				}
			}, {})
	}

}
