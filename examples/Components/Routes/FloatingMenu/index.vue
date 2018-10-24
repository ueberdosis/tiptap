<template>
	<div class="editor">
		<floating-menu class="editor__floating-menu" :editor="editor">
			<template slot-scope="{ nodes, marks }">

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
		</floating-menu>

		<editor-content class="editor__content" :editor="editor" />
	</div>
</template>

<script>
import Icon from 'Components/Icon'
import { Editor, EditorContent, FloatingMenu } from 'tiptap'
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
		FloatingMenu,
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
					new Heading({ maxLevel: 3 }),
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
						Floating Menu
					</h2>
					<p>
						This is an example of a medium-like editor. Enter a new line and some buttons will appear.
					</p>
				`,
			}),
		}
	},
}
</script>

<style lang="scss">
@import "~variables";

.editor {

	position: relative;

	&__floating-menu {
		position: absolute;
		margin-top: -0.25rem;
		visibility: hidden;
		opacity: 0;
		transition: opacity 0.2s, visibility 0.2s;
	}

}
</style>