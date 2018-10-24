<template>
	<div class="editor">
		<menu-bar class="menubar" :editor="editor">
			<template slot-scope="{ nodes, marks }">

				<button
					class="menubar__button"
					:class="{ 'is-active': nodes.paragraph.active({ textAlign: 'left' }) }"
					@click="nodes.paragraph.command({ textAlign: 'left' })"
				>
					<icon name="align-left" />
				</button>

				<button
					class="menubar__button"
					:class="{ 'is-active': nodes.paragraph.active({ textAlign: 'center' }) }"
					@click="nodes.paragraph.command({ textAlign: 'center' })"
				>
					<icon name="align-center" />
				</button>

				<button
					class="menubar__button"
					:class="{ 'is-active': nodes.paragraph.active({ textAlign: 'right' }) }"
					@click="nodes.paragraph.command({ textAlign: 'right' })"
				>
					<icon name="align-right" />
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
	HardBreak,
	Code,
} from 'tiptap-extensions'
import ParagraphAlignment from './Paragraph.js'

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
					new HardBreak(),
					new Code(),
					new ParagraphAlignment(),
				],
				content: `
					<p style="text-align: left">
						Maybe you want to implement text alignment. If so, you're able to overwrite the default <code>ParagraphNode</code>. You can define some classes oder inline styles in your schema to achive that.
					</p>
					<p style="text-align: right">
						Have fun! 🙌
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

<style lang="scss">
.text-align {

	&--left {
		text-align: left;
	}

	&--center {
		text-align: center;
	}

	&--right {
		text-align: right;
	}

}
</style>
