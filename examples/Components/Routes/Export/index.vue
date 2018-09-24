<template>
	<div>
		<editor class="editor" :extensions="extensions" @update="onUpdate" ref="editor">

			<div class="menubar" slot="menubar" slot-scope="{ nodes, marks }">
				<div v-if="nodes && marks">

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

				</div>
			</div>

			<div class="editor__content" slot="content" slot-scope="props">
				<h2>
					Export HTML or JSON
				</h2>
				<p>
					You are able to export your data as <code>HTML</code> or <code>JSON</code>. To pass <code>HTML</code> to the editor use the <code>content</code> slot. To pass <code>JSON</code> to the editor use the <code>doc</code> prop.
				</p>
			</div>

		</editor>

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
import { Editor } from 'tiptap'
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
		Editor,
		Icon,
	},
	data() {
		return {
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
			json: 'Update content to see changes',
			html: 'Update content to see changes',
		}
	},
	methods: {
		onUpdate({ getJSON, getHTML }) {
			this.json = getJSON()
			this.html = getHTML()
		},
		clearContent() {
			this.$refs.editor.clearContent()
			this.$refs.editor.focus()
		},
		setContent() {
			this.$refs.editor.setContent({
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
			})
			this.$refs.editor.focus()
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
