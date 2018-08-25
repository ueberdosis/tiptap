import { Node } from 'tiptap'

export default class IframeNode extends Node {

	get name() {
		return 'iframe'
	}

	get schema() {
		return {
			attrs: {
				src: {
					default: null,
				},
			},
			group: 'block',
			selectable: false,
			parseDOM: [{
				tag: 'iframe',
				getAttrs: dom => ({
					src: dom.getAttribute('src'),
				}),
			}],
			toDOM: node => ['iframe', {
				src: node.attrs.src,
				frameborder: 0,
				allowfullscreen: 'true',
			}],
		}
	}

	get view() {
		return {
			props: ['node', 'updateAttrs', 'editable'],
			data() {
				return {
					url: this.node.attrs.src,
				}
			},
			methods: {
				onChange(event) {
					if (!this.editable) {
						return
					}

					this.url = event.target.value

					this.updateAttrs({
						src: this.url,
					})
				},
			},
			template: `
				<div class="iframe">
					<iframe class="iframe__embed" :src="url"></iframe>
					<input class="iframe__input" type="text" :value="url" @input="onChange" v-if="editable" />
				</div>
			`,
		}
	}

}
