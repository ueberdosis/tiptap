export default {
	props: {
		editor: {
			default: null,
			type: Object,
		},
	},
	methods: {
		unwrap(element) {
			const parent = element.parentNode

			while (element.firstChild) {
				parent.insertBefore(element.firstChild, element)
			}

			parent.removeChild(element)
		},
	},
	watch: {
		'editor.element': {
			immediate: true,
			handler(element) {
				if (element) {
					this.$nextTick(() => {
						this.$el.append(element)
						this.unwrap(element)
					})
				}
			},
		}
	},
	render(createElement) {
		return createElement('div')
	},
}