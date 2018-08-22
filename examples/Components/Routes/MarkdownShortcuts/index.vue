<template>
	<div>
		<editor :editable="true" class="editor" @update="onUpdate">

			<div class="editor__content" slot="content" slot-scope="props">
        <h1>
          Markdown Shortcuts
        </h1>
        <p>
					Start a new line and type <code>"#"</code> followed by a space and you will get an H1 headline. 🤯
				</p>
        <p>
          This feature is called <strong>input rules</strong>. There are some of these shortcuts for the most basic nodes available by default. Try <code>"#, ##, ###, …"</code> for headlines, <code>">"</code> for blockquotes, <code>"- or +"</code> for bullet lists. And of course you can add your own input rules.
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
      console.log(state.doc.toJSON())
    },
  },
}
</script>