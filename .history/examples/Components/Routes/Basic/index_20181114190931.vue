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
						:class="{ 'is-active': marks.strike.active() }"
						@click="marks.strike.command"
					>
						<icon name="strike" />
					</button>

					<button
						class="menubar__button"
						:class="{ 'is-active': marks.underline.active() }"
						@click="marks.underline.command"
					>
						<icon name="underline" />
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
						:class="{ 'is-active': nodes.blockquote.active() }"
						@click="nodes.blockquote.command"
					>
						<icon name="quote" />
					</button>

					<button
						class="menubar__button"
						:class="{ 'is-active': nodes.code_block.active() }"
						@click="nodes.code_block.command"
					>
						<icon name="code" />
					</button>

					<button
						class="menubar__button"
						:class="{ 'is-active': nodes.table.active() }"
						@click="nodes.table.command({type: 'insert', options: {rows: 3,cols: 4, headerRow: false}})"
					>
						insert Table
					</button>

					<button
						class="menubar__button"
						@click="nodes.table.command({type: 'deleteTable'})"
					>
						delete Table
					</button>
					<button
						class="menubar__button"
						@click="nodes.table.command({type: 'splitCell'})"
					>
						split Table
					</button>
					<button
						class="menubar__button"
						@click="nodes.table.command({type: 'mergeCells'})"
					>
						merge Table
					</button>
					<button
						class="menubar__button"
						@click="nodes.table.command({type: 'setCellBackground'})"
					>
						set background
					</button>
					<button
						class="menubar__button"
						@click="nodes.table.command({type: 'toggleHeaderRow'})"
					>
						toggleHeaderCell
					</button>

				</div>
			</div>

			<div class="editor__content" slot="content" slot-scope="props">
				<ul>
					<li>
						A regular list
					</li>
					<li>
						With regular items
					</li>
				</ul>
				<p>The table:</p>
			  <table>
			    <tr><th colspan=3 data-colwidth="100,0,0">Wide header</th></tr>
			    <tr><td>One</td><td>Two</td><td>Three</td></tr>
			    <tr><td>Four</td><td>Five</td><td>Six</td></tr>
			  </table>
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
	CodeBlockNode,
	HardBreakNode,
	HeadingNode,
	OrderedListNode,
	BulletListNode,
	ListItemNode,
	TodoItemNode,
	TodoListNode,
	TableNode,
	BoldMark,
	CodeMark,
	ItalicMark,
	LinkMark,
	StrikeMark,
	UnderlineMark,
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
				new StrikeMark(),
				new UnderlineMark(),
				new HistoryExtension(),
				new TableNode(),
			],
			json: 'Update content to see changes',
			html: 'Update content to see changes',
		}
	},
	created () {
		document.execCommand("enableObjectResizing", false, false)
		document.execCommand("enableInlineTableEditing", false, false)
	},
	methods: {
		onUpdate({ getJSON, getHTML }) {
			this.json = getJSON()
			this.html = getHTML()
		},
		clearContent() {
			this.$refs.editor.clearContent(true)
			this.$refs.editor.focus()
		},
		setContent() {
			// you can pass a json document
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
			}, true)

			// HTML string is also supported
			// this.$refs.editor.setContent('<p>This is some inserted text. 👋</p>')

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