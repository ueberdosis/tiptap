<template>
	<div>
		<editor class="editor" :extensions="extensions">

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
import { Editor } from 'tiptap'
import {
	HardBreakNode,
	HeadingNode,
	BoldMark,
	ItalicMark,
	HistoryExtension,
} from 'tiptap-extensions'
import IframeNode from './Iframe.js'

export default {
	components: {
		Editor,
	},
	data() {
		return {
			extensions: [
				new HardBreakNode(),
				new HeadingNode({ maxLevel: 3 }),
				new BoldMark(),
				new ItalicMark(),
				new HistoryExtension(),
				// custom extension
				new IframeNode(),
			],
		}
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
