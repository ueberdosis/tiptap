<template>
	<div>
		<editor :editable="false" :extensions="extensions" class="editor">

			<div class="editor__content" slot="content" slot-scope="props">
				<h2>
					Read-Only
				</h2>
				<p>
					This text is <strong>read-only</strong>. You are not able to edit something. <a href="https://scrumpy.io/">Links to fancy websites</a> are still working.
				</p>
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
	CodeMark,
	ItalicMark,
	LinkMark,
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
				new BoldMark(),
				new CodeMark(),
				new ItalicMark(),
				new LinkMark(),
			],
		}
	},
}
</script>