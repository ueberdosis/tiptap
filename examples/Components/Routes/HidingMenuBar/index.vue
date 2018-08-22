<template>
	<div>
		<editor :editable="true" class="editor" @update="onUpdate">

			<div class="menubar is-hidden" :class="{ 'is-focused': focused }" slot="menubar" slot-scope="{ nodes, marks, focused }">
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

				</div>
			</div>

			<div class="editor__content" slot="content" slot-scope="props">
        <h1>
          Hiding Menu Bar
        </h1>
        <p>
          Try to focus the editor to see the menu. It's like magic. 🔮
        </p>
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
      this.data = state.doc.toJSON()
    },
  },
}
</script>