<template>
	<div>
		<editor class="editor" :extensions="extensions">

			<div class="editor__content" slot="content" slot-scope="props">
				<h2>
					Mentions
				</h2>
				<p>
					Yeah <span data-mention-type="user" data-mention-id="1">Philipp Kühn</span> and <span data-mention-type="user" data-mention-id="2">Hans Pagel</span>.
				</p>
			</div>

		</editor>
	</div>
</template>

<script>
import Icon from 'Components/Icon'
import { Editor } from 'tiptap'
import {
	BlockquoteNode,
	BulletListNode,
	CodeBlockNode,
	HardBreakNode,
	HeadingNode,
	ListItemNode,
	MentionNode,
	OrderedListNode,
	TodoItemNode,
	TodoListNode,
	BoldMark,
	CodeMark,
	ItalicMark,
	LinkMark,
	HistoryExtension,
} from 'tiptap-extensions'

export default {
	components: {
		Editor,
		Icon,
	},
	data() {
		return {
			extensions: [
				new BlockquoteNode(),
				new BulletListNode(),
				new CodeBlockNode(),
				new HardBreakNode(),
				new HeadingNode({ maxLevel: 3 }),
				new ListItemNode(),
				new MentionNode({
					onEnter(args) {
						console.log('start', args);
					},
					onChange(args) {
						console.log('change', args);
					},
					onExit(args) {
						console.log('stop', args);
					},
				}),
				new OrderedListNode(),
				new TodoItemNode(),
				new TodoListNode(),
				new BoldMark(),
				new CodeMark(),
				new ItalicMark(),
				new LinkMark(),
				new HistoryExtension(),
			],
		}
	},
}
</script>

<style lang="scss">
@import "~variables";

.mention {
  background: rgba($color-black, 0.1);
  color: rgba($color-black, 0.6);
  font-size: 0.8rem;
  font-weight: bold;
  border-radius: 5px;
  padding: 0.2rem 0.5rem;
}
</style>
