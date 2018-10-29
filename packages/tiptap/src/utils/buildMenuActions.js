import { markIsActive, nodeIsActive, getMarkAttrs } from 'tiptap-utils'

export default function ({
 schema, state, commands, editable,
}) {

	const nodes = Object.entries(schema.nodes)
		.map(([name]) => {
			const active = (attrs = {}) => nodeIsActive(state, schema.nodes[name], attrs)
			const command = commands[name] ? commands[name] : () => {}

			return {
				name,
				active,
				command: editable ? command : () => {},
			}
		})
		.reduce((actions, { name, active, command }) => ({
			...actions,
			[name]: {
				active,
				command,
			},
		}), {})

	const marks = Object.entries(schema.marks)
		.map(([name]) => {
			const active = () => markIsActive(state, schema.marks[name])
			const attrs = getMarkAttrs(state, schema.marks[name])
			const command = commands[name] ? commands[name] : () => {}

			return {
				name,
				active,
				attrs,
				command: editable ? command : () => {},
			}
		})
		.reduce((actions, {
			name, active, attrs, command,
		}) => ({
			...actions,
			[name]: {
				active,
				attrs,
				command,
			},
		}), {})

	return {
		nodes,
		marks,
	}

}
