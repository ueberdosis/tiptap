<template>
	<div>
		<editor class="editor" @update="onUpdate">

			<div class="menububble" slot="menububble" slot-scope="{ marks, focus }">
				<template v-if="marks">

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
			</div>

			<div class="editor__content" slot="content" slot-scope="props">
				<h1>
					Bubble Navigation
				</h1>
				<p>
					Hey, try to select some text.
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
  data() {
    return {
      linkUrl: null,
      linkMenuIsActive: false,
    }
  },
  methods: {
    onUpdate(state) {
      console.log(state.doc.toJSON())
    },
  },
}
</script>