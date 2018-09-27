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
			<div
				v-else
				v-for="(user, index) in filteredUsers"
				:key="user.id"
				@click="selectUser(user)"
				class="suggestions__item"
				:class="{ 'is-selected': navigatedUserIndex === index }"
			>
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
	HardBreakNode,
	HeadingNode,
	MentionNode,
} from 'tiptap-extensions'

export default {
	components: {
		Editor,
		Icon,
	},
	data() {
		return {
			extensions: [
				new HardBreakNode(),
				new HeadingNode({ maxLevel: 3 }),
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
					onEnter: ({ items, query }) => {
						this.query = query
						this.filteredUsers = items
					},
					onChange: ({ items, query }) => {
						this.query = query
						this.filteredUsers = items
					},
					onExit: () => {
						this.query = null
						this.filteredUsers = []
					},
					onKeyDown: ({ event }) => {
						// pressing up arrow
						if (event.keyCode === 38) {
							this.upHandler()
							return true
						}
						// pressing down arrow
						if (event.keyCode === 40) {
							this.downHandler()
							return true
						}
						// pressing enter
						if (event.keyCode === 13) {
							this.enterHandler()
							return true
						}

						return false
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
			],
			query: null,
			filteredUsers: [],
			navigatedUserIndex: 0,
		}
	},
	methods: {
		upHandler() {
			this.navigatedUserIndex = ((this.navigatedUserIndex + this.filteredUsers.length) - 1) % this.filteredUsers.length
		},
		downHandler() {
			this.navigatedUserIndex = (this.navigatedUserIndex + 1) % this.filteredUsers.length
		},
		enterHandler() {
			const user = this.filteredUsers[this.navigatedUserIndex]
			this.selectUser(user)
		},
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

	&__item {
		&.is-selected {
			background-color: rgba($color-black, 0.1);
		}
	}
}
</style>
