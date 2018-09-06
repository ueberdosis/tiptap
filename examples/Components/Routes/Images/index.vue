<template>
	<div>
		<editor class="editor" :extensions="extensions">

			<div class="editor__content" slot="content" slot-scope="props">
				<h2>
					Images
				</h2>
				<p>
					This is basic example of implementing images. Try to drop new images here. Reordering also works.
				</p>
				<img src="https://ljdchost.com/8I2DeFn.gif" />
			</div>

		</editor>
	</div>
</template>

<script>
import { Editor } from 'tiptap'
import {
	HardBreakNode,
	HeadingNode,
	ImageNode,
	BoldMark,
	CodeMark,
	ItalicMark,
} from 'tiptap-extensions'

export default {
	components: {
		Editor,
	},
	data() {
		return {
			extensions: [
				new HardBreakNode(),
				new HeadingNode({ maxLevel: 3 }),
				new ImageNode(),
				new BoldMark(),
				new CodeMark(),
				new ItalicMark(),
			],
		}
	},
}
</script>