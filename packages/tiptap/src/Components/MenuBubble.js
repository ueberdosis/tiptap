import MenuBubble from '../Utils/MenuBubble'

export default {
	props: {
		editor: {
			default: null,
			type: Object,
		},
	},
	watch: {
		editor: {
			immediate: true,
			handler(editor) {
				if (editor) {
					this.$nextTick(() => {
						editor.registerPlugin(MenuBubble(this.$el))
					})
				}
			},
		}
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