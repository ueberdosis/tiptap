<template>
	<div>
		<editor :extensions="extensions" class="editor">

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
	CodeBlockNode,
	HardBreakNode,
	HeadingNode,
	TodoItemNode,
	TodoListNode,
	BoldMark,
	CodeMark,
	ItalicMark,
} from 'tiptap-extensions'

export default {
	components: {
		Editor,
		Icon,
	},
	data() {
		return {
			customProp: 2,
			extensions: [
				new CodeBlockNode(),
				new HardBreakNode(),
				new HeadingNode({ maxLevel: 3 }),
				new TodoItemNode(),
				new TodoListNode(),
				new BoldMark(),
				new CodeMark(),
				new ItalicMark(),
			],
		}
	},
}
</script>

<style lang="scss">
@import "~variables";

ul[data-type="todo_list"] {
  padding-left: 0;
}

li[data-type="todo_item"] {
  display: flex;
  flex-direction: row;
}

.todo-checkbox {
  border: 2px solid $color-black;
  height: 0.9em;
  width: 0.9em;
  box-sizing: border-box;
  margin-right: 10px;
  margin-top: 0.3rem;
  user-select: none;
  -webkit-user-select: none;
  cursor: pointer;
  border-radius: 0.2em;
  background-color: transparent;
  transition: 0.4s background;
}

.todo-content {
  flex: 1;
}

li[data-done="true"] {
  text-decoration: line-through;
}

li[data-done="true"] .todo-checkbox {
  background-color: $color-black;
}

li[data-done="false"] {
  text-decoration: none;
}
</style>