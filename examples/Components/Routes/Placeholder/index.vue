<template>
	<div class="editor">
		<editor-content class="editor__content" :editor="editor" />
	</div>
</template>

<script>
import { Editor, EditorContent } from 'tiptap'
import {
	BulletListNode,
	ListItemNode,
	PlaceholderExtension,
} from 'tiptap-extensions'

export default {
	components: {
		EditorContent,
	},
	data() {
		return {
			editor: new Editor({
				extensions: [
					new BulletListNode(),
					new ListItemNode(),
					new PlaceholderExtension({
						emptyNodeClass: 'is-empty',
					}),
				],
			}),
		}
	},
	beforeDestroy() {
		this.editor.destroy()
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
