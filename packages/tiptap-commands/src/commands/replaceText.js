export default function (pos, type, attrs = {}) {
	return (state, dispatch) => {
		const { $from } = state.selection
		const index = $from.index()

		if (!$from.parent.canReplaceWith(index, index, type)) {
			return false
		}

		if (dispatch) {
			// const transform = state.tr
			// 	.replaceWith(pos.from, pos.to, state.schema.nodes.mention.create({ id: 2, type: 'user', label: 'loool' }))
			const transform = state.tr.replaceWith(pos.from, pos.to, type.create(attrs))

			dispatch(transform)
		}

		return true
	}
}
