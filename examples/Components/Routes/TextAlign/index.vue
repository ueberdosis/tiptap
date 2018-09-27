<template>
	<div>
		<editor class="editor" :extensions="extensions">

			<div class="menubar" slot="menubar" slot-scope="{ nodes, marks }">
				<div v-if="nodes && marks">

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

				</div>
			</div>

			<div class="editor__content" slot="content" slot-scope="props">
				<p style="text-align: left">
					Maybe you want to implement text alignment. If so, you're able to overwrite the default <code>ParagraphNode</code>. You can define some classes oder inline styles in your schema to achive that.
				</p>
				<p style="text-align: right">
					Have fun! 🙌
				</p>
			</div>

		</editor>
	</div>
</template>

<script>
import Icon from 'Components/Icon'
import { Editor } from 'tiptap'
import {
	HardBreakNode,
	CodeMark,
} from 'tiptap-extensions'
import ParagraphAlignmentNode from './Paragraph.js'

export default {
	components: {
		Editor,
		Icon,
	},
	data() {
		return {
			extensions: [
				new HardBreakNode(),
				new CodeMark(),
				new ParagraphAlignmentNode(),
			],
		}
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
