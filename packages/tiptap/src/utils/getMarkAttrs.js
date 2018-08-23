export default function (state, type) {
	const { from, to } = state.selection
	let marks = []

	state.doc.nodesBetween(from, to, node => {
		marks = [...marks, ...node.marks]
	})

	const mark = marks.find(mark => mark.type.name === type.name)

	if (mark) {
		return mark.attrs
	}

	return {}
}
