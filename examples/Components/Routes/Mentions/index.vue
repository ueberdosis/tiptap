<template>
	<div>
		<editor class="editor" :extensions="extensions" ref="editor">

			<div class="editor__content" slot="content" slot-scope="props">
				<h2>
					Mentions
				</h2>
				<p>
					Yeah <span data-mention-id="1">Philipp Kühn</span> and <span data-mention-id="2">Hans Pagel</span>.
				</p>
			</div>

		</editor>

		<div class="suggestion-list" v-show="query || filteredUsers.length" ref="suggestions">
			<div class="suggestion-list__item" v-if="query && !filteredUsers.length">
				No users found.
			</div>
			<div
				v-else
				v-for="(user, index) in filteredUsers"
				:key="user.id"
				@click="selectUser(user)"
				class="suggestion-list__item"
				:class="{ 'is-selected': navigatedUserIndex === index }"
			>
				{{ user.name }}
			</div>
		</div>
	</div>
</template>

<script>
import Fuse from 'fuse.js'
import tippy from 'tippy.js'
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
					onEnter: ({ items, query, range, command, virtualNode }) => {
						this.query = query
						this.filteredUsers = items
						this.pos = range
						this.insertMention = command
						this.renderDropdown(virtualNode)
					},
					onChange: ({ items, query, range, virtualNode }) => {
						this.query = query
						this.filteredUsers = items
						this.pos = range
						this.renderDropdown(virtualNode)
					},
					onExit: () => {
						this.query = null
						this.filteredUsers = []
						this.pos = null
						this.destroyDropdown()
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
			pos: null,
			filteredUsers: [],
			navigatedUserIndex: 0,
			insertMention: () => {},
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

			if (user) {
				this.selectUser(user)
			}
		},
		selectUser(user) {
			this.insertMention({
				pos: this.pos,
				attrs: {
					id: user.id,
					label: user.name,
				},
			})
		},
		renderDropdown(node) {
			if (this.dropdown) {
				return
			}

			this.dropdown = tippy(node, {
				content: this.$refs.suggestions,
				trigger: 'mouseenter',
				interactive: true,
				theme: 'dark',
				placement: 'top-start',
				performance: true,
				inertia: true,
				duration: [400, 200],
				showOnInit: true,
				arrow: true,
				arrowType: 'round',
			})
		},
		destroyDropdown() {
			if (this.dropdown) {
				this.dropdown.destroyAll()
				this.dropdown = null
			}
		},
	},
}
</script>

<style lang="scss">
@import "~variables";
@import '~modules/tippy.js/dist/tippy.css';

.mention {
  background: rgba($color-black, 0.1);
  color: rgba($color-black, 0.6);
  font-size: 0.8rem;
  font-weight: bold;
  border-radius: 5px;
  padding: 0.2rem 0.5rem;
	white-space: nowrap;
}

.mention-suggestion {
	color: rgba($color-black, 0.6);
}

.suggestion-list {
	padding: 0.2rem;
	border: 2px solid rgba($color-black, 0.1);
	font-size: 0.8rem;
	font-weight: bold;

	&__no-results {
		padding: 0.2rem 0.5rem;
	}

	&__item {
		border-radius: 5px;
		padding: 0.2rem 0.5rem;

		&.is-selected {
			background-color: rgba($color-white, 0.2);
		}
	}
}

.tippy-tooltip.dark-theme {

	background-color: $color-black;
	padding: 0;
	font-size: 1rem;
	text-align: inherit;
	color: $color-white;
	border-radius: 5px;

	.tippy-backdrop {
		display: none;
	}

	.tippy-roundarrow {
		fill: $color-black;
	}

	.tippy-popper[x-placement^=top] & .tippy-arrow {
		border-top-color: $color-black;
	}

	.tippy-popper[x-placement^=bottom] & .tippy-arrow {
		border-bottom-color: $color-black;
	}

	.tippy-popper[x-placement^=left] & .tippy-arrow {
		border-left-color: $color-black;
	}

	.tippy-popper[x-placement^=right] & .tippy-arrow {
		border-right-color: $color-black;
	}

}
</style>
