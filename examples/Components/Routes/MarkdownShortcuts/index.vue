<template>
	<div class="editor">
		<editor-content class="editor__content" :editor="editor" />
	</div>
</template>

<script>
import Icon from 'Components/Icon'
import { Editor, EditorContent } from 'tiptap'
import {
	Blockquote,
	BulletList,
	CodeBlock,
	HardBreak,
	Heading,
	ListItem,
	OrderedList,
	TodoItem,
	TodoList,
	Bold,
	Code,
	Italic,
	Link,
	History,
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
					new Blockquote(),
					new BulletList(),
					new CodeBlock(),
					new HardBreak(),
					new Heading({ levels: [1, 2, 3] }),
					new ListItem(),
					new OrderedList(),
					new TodoItem(),
					new TodoList(),
					new Bold(),
					new Code(),
					new Italic(),
					new Link(),
					new History(),
				],
				content: `
					<h2>
						down Shortcuts
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