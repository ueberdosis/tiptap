<template>
	<div>
		<editor class="editor" :extensions="extensions">
			<div class="menubar" slot="menubar" slot-scope="{ nodes, state }">
				<!-- {{ state }} -->
				<!-- <div v-if="extensions"> -->
					<!-- <button
						class="menubar__button"
						@click="this.alignment = ''">
					Left
					</button> -->
					<button
						class="menubar__button"
						@click="align(state)">
						Right
					</button>

				<!-- </div> -->
			</div>

			<div class="editor__content" slot="content" slot-scope="props">
				<p>something</p>
			</div>
		</editor>
	</div>
</template>

<script>
import { Editor } from '/home/jay/codeBase/node/tiptap/packages/tiptap/src/index.js'
import {
	EventFactory,
	AlignmentExtension
} from '/home/jay/codeBase/node/tiptap/packages/tiptap-extensions/src/index.js'

export default {
	components: {
		Editor
	},
	computed: {
		// alignment () {
		// 	return this.
		// }
	},
	data() {
		return {
			extensions: [
				new AlignmentExtension()
			],
		}
	},
	methods: {
		...EventFactory('align'),
		test (state) {
			debugger
		}
	}
}
</script>

<style lang="scss">
.editor p.is-empty:first-child::before {
	content: 'Start typing…';
	float: left;
	color: #aaa;
	pointer-events: none;
	height: 0;
	font-style: italic;
}
</style>
