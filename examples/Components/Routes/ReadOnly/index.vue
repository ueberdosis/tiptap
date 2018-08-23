<template>
	<div>
		<editor :editable="false" :extensions="extensions" class="editor" @update="onUpdate">

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
				new Heading(),
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