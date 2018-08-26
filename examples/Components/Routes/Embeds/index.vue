<template>
	<div>
		<editor class="editor" :extensions="extensions" @update="onUpdate">

			<div class="editor__content" slot="content" slot-scope="props">
				<h2>
					Embeds
				</h2>
				<p>
					This is an example of a custom iframe node. This iframe is rendered as a <strong>vue component</strong>. This makes it possible to render the input below to change its source.
				</p>
				<iframe src="https://www.youtube.com/embed/XIMLoLxmTDw" frameborder="0" allowfullscreen></iframe>
			</div>

		</editor>
	</div>
</template>

<script>
import Icon from 'Components/Icon'
import { Editor } from 'tiptap'
import {
	BlockquoteNode,
	BulletListNode,
	CodeBlockNode,
	HardBreakNode,
	HeadingNode,
	ListItemNode,
	OrderedListNode,
	TodoItemNode,
	TodoListNode,
	BoldMark,
	CodeMark,
	ItalicMark,
	LinkMark,
	HistoryExtension,
} from 'tiptap-extensions'
import IframeNode from './Iframe.js'

export default {
	components: {
		Editor,
		Icon,
	},
	data() {
		return {
			extensions: [
				new BlockquoteNode(),
				new BulletListNode(),
				new CodeBlockNode(),
				new HardBreakNode(),
				new HeadingNode({ maxLevel: 3 }),
				new ListItemNode(),
				new OrderedListNode(),
				new TodoItemNode(),
				new TodoListNode(),
				new BoldMark(),
				new CodeMark(),
				new ItalicMark(),
				new LinkMark(),
				new HistoryExtension(),
				// custom extension
				new IframeNode(),
			],
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
