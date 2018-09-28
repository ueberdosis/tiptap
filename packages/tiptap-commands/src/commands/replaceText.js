export default function (pos, type, attrs = {}) {
	return (state, dispatch) => {
		const { $from } = state.selection
		const index = $from.index()

		if (!$from.parent.canReplaceWith(index, index, type)) {
			return false
		}

		if (dispatch) {
			dispatch(state.tr.replaceWith(pos.from, pos.to, type.create(attrs)))
		}

		return true
	}
}
