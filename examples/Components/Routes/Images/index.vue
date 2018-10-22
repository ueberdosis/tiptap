<template>
	<div class="editor">
		<menu-bar class="menubar" :editor="editor">
			<template slot-scope="{ nodes }">
				<button
					class="menubar__button"
					@click="showImagePrompt(nodes.image.command)"
				>
					<icon name="image" />
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
	HardBreakNode,
	HeadingNode,
	ImageNode,
	BoldMark,
	CodeMark,
	ItalicMark,
} from 'tiptap-extensions'

export default {
	components: {
		Icon,
		EditorContent,
		MenuBar,
	},
	data() {
		return {
			editor: new Editor({
				extensions: [
					new HardBreakNode(),
					new HeadingNode({ maxLevel: 3 }),
					new ImageNode(),
					new BoldMark(),
					new CodeMark(),
					new ItalicMark(),
				],
				content: `
					<h2>
						Images
					</h2>
					<p>
						This is basic example of implementing images. Try to drop new images here. Reordering also works.
					</p>
					<img src="https://ljdchost.com/8I2DeFn.gif" />
				`,
			}),
		}
	},
	methods: {
		showImagePrompt(command) {
			const src = prompt('Enter the url of your image here')
			if (src !== null) {
				command({ src })
			}
		},
	},
}
</script>