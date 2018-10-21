export default {
	props: {
		editor: {
			default: null,
			type: Object,
		},
	},
	render(createElement) {
		return createElement('div')
	},
	watch: {
		'editor.element': {
			immediate: true,
			handler(element) {
				if (element) {
					this.$nextTick(() => {
						this.$el.append(element)
					})
				}
			},
		}
	},
}