<template>
	<div>
		<div class="editor">
			<menu-bar class="menubar" :editor="editor">
				<template slot-scope="{ nodes, marks }">

					<button
						class="menubar__button"
						:class="{ 'is-active': marks.bold.active() }"
						@click="marks.bold.command"
					>
						<icon name="bold" />
					</button>

					<button
						class="menubar__button"
						:class="{ 'is-active': marks.italic.active() }"
						@click="marks.italic.command"
					>
						<icon name="italic" />
					</button>

					<button
						class="menubar__button"
						@click="marks.code.command"
						:class="{ 'is-active': marks.code.active() }
					">
						<icon name="code" />
					</button>

					<button
						class="menubar__button"
						:class="{ 'is-active': nodes.paragraph.active() }"
						@click="nodes.paragraph.command"
					>
						<icon name="paragraph" />
					</button>

					<button
						class="menubar__button"
						:class="{ 'is-active': nodes.heading.active({ level: 1 }) }"
						@click="nodes.heading.command({ level: 1 })"
					>
						H1
					</button>

					<button
						class="menubar__button"
						:class="{ 'is-active': nodes.heading.active({ level: 2 }) }"
						@click="nodes.heading.command({ level: 2 })"
					>
						H2
					</button>

					<button
						class="menubar__button"
						:class="{ 'is-active': nodes.heading.active({ level: 3 }) }"
						@click="nodes.heading.command({ level: 3 })"
					>
						H3
					</button>

					<button
						class="menubar__button"
						:class="{ 'is-active': nodes.bullet_list.active() }"
						@click="nodes.bullet_list.command"
					>
						<icon name="ul" />
					</button>

					<button
						class="menubar__button"
						:class="{ 'is-active': nodes.ordered_list.active() }"
						@click="nodes.ordered_list.command"
					>
						<icon name="ol" />
					</button>

					<button
						class="menubar__button"
						:class="{ 'is-active': nodes.code_block.active() }"
						@click="nodes.code_block.command"
					>
						<icon name="code" />
					</button>

				</template>
			</menu-bar>

			<editor-content class="editor__content" :editor="editor" />

		</div>

		<div class="actions">
			<button class="button" @click="clearContent">
				Clear Content
			</button>
			<button class="button" @click="setContent">
				Set Content
			</button>
		</div>

		<div class="export">
			<h3>JSON</h3>
			<pre><code v-html="json"></code></pre>

			<h3>HTML</h3>
			<pre><code>{{ html }}</code></pre>
		</div>
	</div>
</template>

<script>
import Icon from 'Components/Icon'
import { Editor, EditorContent, MenuBar } from 'tiptap'
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
		MenuBar,
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
						Export HTML or JSON
					</h2>
					<p>
						You are able to export your data as <code>HTML</code> or <code>JSON</code>. To pass <code>HTML</code> to the editor use the <code>content</code> slot. To pass <code>JSON</code> to the editor use the <code>doc</code> prop.
					</p>
				`,
				onUpdate: ({ getJSON, getHTML }) => {
					this.json = getJSON()
					this.html = getHTML()
				},
			}),
			json: 'Update content to see changes',
			html: 'Update content to see changes',
		}
	},
	methods: {
		clearContent() {
			this.editor.clearContent(true)
			this.editor.focus()
		},
		setContent() {
			// you can pass a json document
			this.editor.setContent({
				type: 'doc',
				content: [{
					type: 'paragraph',
					content: [
						{
							type: 'text',
							text: 'This is some inserted text. 👋',
						},
					],
				}],
			}, true)

			// HTML string is also supported
			// this.editor.setContent('<p>This is some inserted text. 👋</p>')

			this.editor.focus()
		},
	},
}
</script>

<style lang="scss" scoped>
@import "~variables";

.actions {
	max-width: 30rem;
	margin: 0 auto 2rem auto;
}

.export {

	max-width: 30rem;
	margin: 0 auto 2rem auto;

	pre {
		padding: 1rem;
		border-radius: 5px;
		font-size: 0.8rem;
		font-weight: bold;
		background: rgba($color-black, 0.05);
		color: rgba($color-black, 0.8);
	}

	code {
		display: block;
		white-space: pre-wrap;
	}
}
</style>
