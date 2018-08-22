<template>
	<div>
		<editor :editable="true" class="editor" @update="onUpdate">

			<div class="menubar" slot="menubar" slot-scope="{ nodes, marks }">
				<div v-if="nodes && marks">

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
        <h1>
          Todo Lists
        </h1>
        <ul data-type="todo_list">
					<li data-type="todo_item" data-done="true">
						Buy beer
					</li>
					<li data-type="todo_item" data-done="true">
						Buy meat
					</li>
					<li data-type="todo_item" data-done="false">
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

export default {
  components: {
    Editor,
    Icon,
  },
  methods: {
    onUpdate(state) {
      console.log(state.doc.toJSON())
    },
  },
}
</script>