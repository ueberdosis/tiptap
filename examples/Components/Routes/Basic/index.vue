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

				</template>
			</menu-bar>

			<editor-content class="editor__content" :editor="editor" />
		</div>

		<!-- <editor class="editor" :extensions="extensions">

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

				</div>
			</div>

			<div class="editor__content" slot="content" slot-scope="props">
				<h2>
					Hi there,
				</h2>
				<p>
					this is a very <em>basic</em> example of tiptap.
				</p>
				<pre><code>body { display: none; }</code></pre>
				<ul>
					<li>
						A regular list
					</li>
					<li>
						With regular items
					</li>
				</ul>
				<blockquote>
					It's amazing 👏
					<br />
					– mom
				</blockquote>
			</div>

		</editor> -->
	</div>
</template>

<script>
import Icon from 'Components/Icon'
import { Editor, EditorContent, MenuBar } from 'tiptap'
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
	StrikeMark,
	UnderlineMark,
	HistoryExtension,
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
				editable: true,
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
				],
				content: {
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
				},
			}),
		}
	},
}
</script>