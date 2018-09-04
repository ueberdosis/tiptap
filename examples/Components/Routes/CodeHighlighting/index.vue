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

import { javascript, css } from './examples'

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
		}
	},
}
</script>

<style lang="scss">

pre {
	&::before {
		content: attr(data-language);
		text-transform: uppercase;
		display: block;
		text-align: right;
		font-weight: bold;
		font-size: 0.6rem;
	}

	code {

		.hljs-comment,
		.hljs-quote {
			color: #999999;
		}

		.hljs-variable,
		.hljs-template-variable,
		.hljs-attribute,
		.hljs-tag,
		.hljs-name,
		.hljs-regexp,
		.hljs-link,
		.hljs-name,
		.hljs-selector-id,
		.hljs-selector-class {
			color: #f2777a;
		}

		.hljs-number,
		.hljs-meta,
		.hljs-built_in,
		.hljs-builtin-name,
		.hljs-literal,
		.hljs-type,
		.hljs-params {
			color: #f99157;
		}

		.hljs-string,
		.hljs-symbol,
		.hljs-bullet {
			color: #99cc99;
		}

		.hljs-title,
		.hljs-section {
			color: #ffcc66;
		}

		.hljs-keyword,
		.hljs-selector-tag {
			color: #6699cc;
		}

		.hljs-emphasis {
			font-style: italic;
		}

		.hljs-strong {
			font-weight: 700;
		}
	}
}
</style>
