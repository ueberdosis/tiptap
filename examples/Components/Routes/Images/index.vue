<template>
	<div>
		<editor class="editor" :extensions="extensions">

			<div class="menubar" slot="menubar" slot-scope="{ nodes }">
				<div v-if="nodes">

					<button
						class="menubar__button"
						@click="showImagePrompt(nodes.image.command)"
					>
						<icon name="image" />
					</button>

				</div>
			</div>

			<div class="editor__content" slot="content" slot-scope="props">
				<h2>
					Images
				</h2>
				<p>
					This is basic example of implementing images. Try to drop new images here. Reordering also works.
				</p>
				<img src="https://ljdchost.com/8I2DeFn.gif" />
			</div>

		</editor>
	</div>
</template>

<script>
import Icon from 'Components/Icon'
import { Editor } from 'tiptap'
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
		Editor,
	},
	data() {
		return {
			extensions: [
				new HardBreakNode(),
				new HeadingNode({ maxLevel: 3 }),
				new ImageNode(),
				new BoldMark(),
				new CodeMark(),
				new ItalicMark(),
			],
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