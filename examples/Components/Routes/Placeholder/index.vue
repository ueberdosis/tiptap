<template>
	<div>
		<editor class="editor" :extensions="extensions">
			<div class="editor__content" slot="content" slot-scope="props"></div>
		</editor>
	</div>
</template>

<script>
import { Editor } from 'tiptap'
import { PlaceholderExtension } from 'tiptap-extensions'

export default {
	components: {
		Editor,
	},
	data() {
		return {
			extensions: [
				new PlaceholderExtension(),
			],
		}
	},
}
</script>

<style lang="scss">
.editor p.is-empty:first-child::before {
	content: 'Start typing…';
	float: left;
	color: #aaa;
	pointer-events: none;
	height: 0;
	font-style: italic;
}
</style>
