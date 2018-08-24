<template>
	<div>
		<editor class="editor" :extensions="extensions" @update="onUpdate">

			<div class="editor__content" slot="content" slot-scope="props">
				<h2>
					Markdown Shortcuts
				</h2>
				<p>
					Start a new line and type <code>#</code> followed by a <code>space</code> and you will get an H1 headline.
				</p>
				<p>
					This feature is called <strong>input rules</strong>. There are some of these shortcuts for the most basic nodes enabled by default. Try <code>#, ##, ###, …</code> for headlines, <code>></code> for blockquotes, <code>- or +</code> for bullet lists. And of course you can add your own input rules.
				</p>
			</div>

		</editor>
	</div>
</template>

<script>
import Icon from 'Components/Icon'
import { Editor } from 'tiptap'
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
} from 'tiptap-extensions'

export default {
	components: {
		Editor,
		Icon,
	},
	data() {
		return {
			extensions: [
				new Blockquote(),
				new BulletList(),
				new CodeBlock(),
				new HardBreak(),
				new Heading({ maxLevel: 3 }),
				new ListItem(),
				new OrderedList(),
				new TodoItem(),
				new TodoList(),
				new Bold(),
				new Code(),
				new Italic(),
				new Link(),
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