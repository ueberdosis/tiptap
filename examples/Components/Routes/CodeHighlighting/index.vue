<template>
	<div>
		<editor class="editor" :extensions="extensions">

			<div class="editor__content" slot="content" slot-scope="props">
				<h2>
					Code Highlighting
				</h2>
				<p>
					These are code blocks with <strong>automatic syntax highlighting</strong> based on highlight.js.
				</p>
				<pre><code v-html="javascript"></code></pre>
				<pre><code v-html="css"></code></pre>
				<pre><code v-html="php"></code></pre>
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
	CodeBlockHighlightNode,
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

import { javascript, css, php } from './examples'

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
				new CodeBlockHighlightNode(),
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
			],
			javascript,
			css,
			php,
		}
	},
}
</script>