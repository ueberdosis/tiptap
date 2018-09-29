<template>
	<div>
		<editor class="editor" :extensions="extensions" ref="editor">

			<div class="editor__content" slot="content" slot-scope="props">
				<h2>
					Suggestions
				</h2>
				<p>
					Sometimes it's useful to <strong>mention</strong> someone. That's a feature we're very used to. Under the hood this technique can also be used for other features likes <strong>hashtags</strong> and <strong>commands</strong> – lets call it <em>suggestions</em>.
				</p>
				<p>
					This is an example how to mention some users like <span data-mention-id="1">Philipp Kühn</span> or <span data-mention-id="2">Hans Pagel</span>. Try to type <code>@</code> and a popup (rendered with tippy.js) will appear. You can navigate with arrow keys through a list of suggestions.
				</p>
			</div>

		</editor>

		<div class="suggestion-list" v-show="showSuggestions" ref="suggestions">
			<template v-if="hasResults">
				<div
					v-for="(user, index) in filteredUsers"
					:key="user.id"
					class="suggestion-list__item"
					:class="{ 'is-selected': navigatedUserIndex === index }"
					@click="selectUser(user)"
				>
					{{ user.name }}
				</div>
			</template>
			<div v-else class="suggestion-list__item">
				No users found.
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
	CodeMark,
	BoldMark,
	ItalicMark,
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
						{ id: 1, name: 'Philipp Kühn' },
						{ id: 2, name: 'Hans Pagel' },
						{ id: 3, name: 'Kris Siepert' },
						{ id: 4, name: 'Justin Schueler' },
					],
					onEnter: ({ items, query, range, command, virtualNode }) => {
						this.query = query
						this.filteredUsers = items
						this.mentionPosition = range
						this.insertMention = command
						this.renderPopup(virtualNode)
					},
					onChange: ({ items, query, range, virtualNode }) => {
						this.query = query
						this.filteredUsers = items
						this.mentionPosition = range
						this.navigatedUserIndex = 0
						this.renderPopup(virtualNode)
					},
					onExit: () => {
						this.query = null
						this.filteredUsers = []
						this.mentionPosition = null
						this.navigatedUserIndex = 0
						this.destroyPopup()
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
				new CodeMark(),
				new BoldMark(),
				new ItalicMark(),
			],
			query: null,
			mentionPosition: null,
			filteredUsers: [],
			navigatedUserIndex: 0,
			insertMention: () => {},
		}
	},
	computed: {
		hasResults() {
			return this.filteredUsers.length
		},
		showSuggestions() {
			return this.query || this.hasResults
		},
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
				position: this.mentionPosition,
				attrs: {
					id: user.id,
					label: user.name,
				},
			})
		},
		renderPopup(node) {
			if (this.popup) {
				return
			}

			this.popup = tippy(node, {
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
		destroyPopup() {
			if (this.popup) {
				this.popup.destroyAll()
				this.popup = null
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
