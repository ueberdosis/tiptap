<template>
	<div>
		<editor class="editor" :extensions="extensions" @update="onUpdate">

			<div class="editor__content" slot="content" slot-scope="props">
				<h1>
					Embeds
				</h1>
				<p>
					This is an example of a custom iframe node. This iframe is rendered as a vue component. This makes it possible to render some additional markup to change its source.
				</p>
				<iframe src="https://www.youtube.com/embed/XIMLoLxmTDw" frameborder="0" allowfullscreen></iframe>
			</div>

		</editor>
	</div>
</template>

<script>
import Icon from 'Components/Icon'
import { Editor } from 'tiptap'
import Iframe from './Iframe.js'

export default {
	components: {
		Editor,
		Icon,
	},
	data() {
		return {
			extensions: [new Iframe()],
		}
	},
	methods: {
		onUpdate(state) {
			// console.log(state.doc.toJSON())
		},
	},
}
</script>

<style lang="scss">
@import "~variables";

.iframe {
	&__embed {
		width: 100%;
		height: 15rem;
		border: 0;
	}

	&__input {
		display: block;
		width: 100%;
		font: inherit;
		border: 0;
		border-radius: 5px;
		background-color: rgba($color-black, 0.1);
		padding: 0.3rem 0.5rem;
	}
}
</style>
