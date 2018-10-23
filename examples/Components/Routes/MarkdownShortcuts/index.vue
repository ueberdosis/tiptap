<template>
	<div class="editor">
		<editor-content class="editor__content" :editor="editor" />
	</div>
</template>

<script>
import Icon from 'Components/Icon'
import { Editor, EditorContent } from 'tiptap'
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

export default {
	components: {
		EditorContent,
		Icon,
	},
	data() {
		return {
			editor: new Editor({
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
				],
				content: `
					<h2>
						Markdown Shortcuts
					</h2>
					<p>
						Start a new line and type <code>#</code> followed by a <code>space</code> and you will get an H1 headline.
					</p>
					<p>
						This feature is called <strong>input rules</strong>. There are some of these shortcuts for the most basic nodes enabled by default. Try <code>#, ##, ###, …</code> for headlines, <code>></code> for blockquotes, <code>- or +</code> for bullet lists. And of course you can add your own input rules.
					</p>
				`,
			}),
		}
	},
	beforeDestroy() {
		this.editor.destroy()
	},
}
</script>