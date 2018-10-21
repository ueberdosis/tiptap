export default {
	props: {
		editor: {
			default: null,
			type: Object,
		},
	},
	render(createElement) {
		if (this.editor) {
			return createElement('div', this.$scopedSlots.default({
				nodes: this.editor.menuActions.nodes,
				marks: this.editor.menuActions.marks,
			}))
		}
	},
}