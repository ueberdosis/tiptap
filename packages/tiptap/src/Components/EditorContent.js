export default {
	props: {
		editor: {
			default: null,
			type: Object,
		},
	},
	render(createElement) {
		// console.log('createElement', this.editor)
		// if (this.editor) {
		// 	console.log('create element', this.editor.element)
		// 	return this.editor.element
		// 	// return createElement('div', {}, this.editor.element.innerHTML)
		// }
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
	created() {
		// console.log('on init')
		// this.editor.on('init', () => {
		// 	console.log('iniiiitttt!!!')
		// })
		// setTimeout(() => {
		// 	// this.$el.innerHTML = this.editor.element.innerHTML
		// 	this.$el.append(this.editor.element)
		// }, 1000);
	},
}