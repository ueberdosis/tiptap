<template>
	<div>
		<editor :editable="false" class="editor" @update="onUpdate">

			<div class="editor__content" slot="content" slot-scope="props">
				<h2>
					Read-Only
				</h2>
				<p>
					This text is <strong>read-only</strong>. You are not able to edit something. <a href="https://scrumpy.io/">Links to fancy websites</a> are still working.
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
			// console.log(state.doc.toJSON())
		},
	},
}
</script>