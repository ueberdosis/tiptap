<template>
	<div>
		<editor class="editor" :extensions="extensions" ref="editor">

			<div class="editor__content" slot="content" slot-scope="props">
				<h2>
					Mentions
				</h2>
				<p>
					Yeah <span data-mention-type="user" data-mention-id="1">Philipp Kühn</span> and <span data-mention-type="user" data-mention-id="2">Hans Pagel</span>.
				</p>
			</div>

		</editor>

		<div class="suggestions">
			<div v-if="query && !filteredUsers.length">
				No users found.
			</div>
			<div v-else v-for="user in filteredUsers" :key="user.id" @click="selectUser(user)">
				{{ user.name }}
			</div>
		</div>
	</div>
</template>

<script>
import Fuse from 'fuse.js'
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
					items: [
						{
							name: 'Philipp Kühn',
							id: 1,
						},
						{
							name: 'Hans Pagel',
							id: 2,
						},
					],
					onEnter: args => {
						console.log('start', args)
						this.query = args.query
						this.filteredUsers = args.items
					},
					onChange: args => {
						console.log('change', args)
						this.query = args.query
						this.filteredUsers = args.items
					},
					onExit: args => {
						console.log('stop', args)
						this.query = null
						this.filteredUsers = args.items
					},
					onFilter: (items, query) => {
						if (!query) {
							return items
						}

						const fuse = new Fuse(items, {
							threshold: 0.2,
							keys: [
								'name',
							],
						})

						return fuse.search(query)
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
			query: null,
			filteredUsers: [],
		}
	},
	methods: {
		selectUser(user) {
			this.$refs.editor.menuActions.nodes.mention.command({
				type: 'user',
				id: user.id,
				label: user.name,
			})
		},
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

.suggestions {
	max-width: 30rem;
	margin: 0 auto 2rem auto;
}
</style>
