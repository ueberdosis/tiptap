<template>
	<div class="editor">
		<menu-bubble class="menububble" :editor="editor">
			<template slot-scope="{ nodes, marks }">

				<button
					class="menububble__button"
					:class="{ 'is-active': marks.bold.active() }"
					@click="marks.bold.command"
				>
					<icon name="bold" />
				</button>

				<button
					class="menububble__button"
					:class="{ 'is-active': marks.italic.active() }"
					@click="marks.italic.command"
				>
					<icon name="italic" />
				</button>

				<button
					class="menububble__button"
					:class="{ 'is-active': marks.code.active() }"
					@click="marks.code.command"
				>
					<icon name="code" />
				</button>

			</template>
		</menu-bubble>

		<editor-content class="editor__content" :editor="editor" />
	</div>
</template>

<script>
import Icon from 'Components/Icon'
import { Editor, EditorContent, MenuBubble } from 'tiptap'
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
		MenuBubble,
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
					new StrikeMark(),
					new UnderlineMark(),
					new HistoryExtension(),
				],
				content: `
					<h2>
						Menu Bubble
					</h2>
					<p>
						Hey, try to select some text here. There will popup a menu for selecting some inline styles. <em>Remember:</em> you have full control about content and styling of this menu.
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