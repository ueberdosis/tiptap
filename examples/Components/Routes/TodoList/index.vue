<template>
	<div>
		<editor :extensions="extensions" class="editor" @update="onUpdate">

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
						:class="{ 'is-active': marks.code.active() }"
						@click="marks.code.command"
					>
						<icon name="code" />
					</button>

					<button
						class="menubar__button"
						:class="{ 'is-active': nodes.todo_list.active() }"
						@click="nodes.todo_list.command"
					>
						<icon name="checklist" />
					</button>

				</div>
			</div>

			<div class="editor__content" slot="content" slot-scope="props">
				<h2>
					Todo List
				</h2>
				<p>
					There is always something to do. Thankfully, there are checklists for that. Don't forget to call mom.
				</p>
				<ul data-type="todo_list">
					<li data-type="todo_item" data-done="true">
						Buy beer
					</li>
					<li data-type="todo_item" data-done="true">
						Buy meat
					</li>
					<li data-type="todo_item" data-done="true">
						Buy milk
					</li>
					<li data-type="todo_item" data-done="false">
						Call mom
					</li>
				</ul>
			</div>

		</editor>
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
		}
	},
	methods: {
		onUpdate(state) {
			// console.log(state.doc.toJSON())
		},
	},
}
</script>