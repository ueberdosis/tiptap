<template>
	<div class="editor">
		<menu-bar class="menubar" :editor="editor">
			<template slot-scope="{ nodes, marks, commands }">

				<button
					class="menubar__button"
					@click="commands.undo"
				>
					⬅
				</button>

				<button
					class="menubar__button"
					@click="commands.redo"
				>
					➡
				</button>

				<button
					class="menubar__button"
					:class="{ 'is-active': marks.bold.active() }"
					@click="commands.bold"
				>
					<icon name="bold" />
				</button>

				<button
					class="menubar__button"
					:class="{ 'is-active': marks.italic.active() }"
					@click="commands.italic"
				>
					<icon name="italic" />
				</button>

				<button
					class="menubar__button"
					:class="{ 'is-active': marks.strike.active() }"
					@click="commands.strike"
				>
					<icon name="strike" />
				</button>

				<button
					class="menubar__button"
					:class="{ 'is-active': marks.underline.active() }"
					@click="commands.underline"
				>
					<icon name="underline" />
				</button>

				<button
					class="menubar__button"
					:class="{ 'is-active': marks.code.active() }"
					@click="commands.code"
				>
					<icon name="code" />
				</button>

				<button
					class="menubar__button"
					:class="{ 'is-active': nodes.paragraph.active() }"
					@click="commands.paragraph"
				>
					<icon name="paragraph" />
				</button>

				<button
					class="menubar__button"
					:class="{ 'is-active': nodes.heading.active({ level: 1 }) }"
					@click="commands.heading({ level: 1 })"
				>
					H1
				</button>

				<button
					class="menubar__button"
					:class="{ 'is-active': nodes.heading.active({ level: 2 }) }"
					@click="commands.heading({ level: 2 })"
				>
					H2
				</button>

				<button
					class="menubar__button"
					:class="{ 'is-active': nodes.heading.active({ level: 3 }) }"
					@click="commands.heading({ level: 3 })"
				>
					H3
				</button>

				<button
					class="menubar__button"
					:class="{ 'is-active': nodes.bullet_list.active() }"
					@click="commands.bullet_list"
				>
					<icon name="ul" />
				</button>

				<button
					class="menubar__button"
					:class="{ 'is-active': nodes.ordered_list.active() }"
					@click="commands.ordered_list"
				>
					<icon name="ol" />
				</button>

				<button
					class="menubar__button"
					:class="{ 'is-active': nodes.blockquote.active() }"
					@click="commands.blockquote"
				>
					<icon name="quote" />
				</button>

				<button
					class="menubar__button"
					:class="{ 'is-active': nodes.code_block.active() }"
					@click="commands.code_block"
				>
					<icon name="code" />
				</button>

			</template>
		</menu-bar>

		<editor-content class="editor__content" :editor="editor" />
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
	Strike,
	Underline,
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
					new Strike(),
					new Underline(),
					new History(),
				],
				content: `
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
				`,
			}),
		}
	},
	beforeDestroy() {
		this.editor.destroy()
	},
}
</script>