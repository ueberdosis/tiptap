<template>
	<div>
		<editor class="editor" :extensions="extensions">
			<div class="menububble" slot="menububble" slot-scope="{ marks, focus }">
				<template v-if="marks">

					<form class="menububble__form" v-if="linkMenuIsActive" @submit.prevent="setLinkUrl(linkUrl, marks.link, focus)">
						<input class="menububble__input" type="text" v-model="linkUrl" placeholder="https://" ref="linkInput" @keydown.esc="hideLinkMenu"/>
						<button class="menububble__button" @click="setLinkUrl(null, marks.link, focus)" type="button">
							<icon name="remove" />
						</button>
					</form>

					<template v-else>
						<button
							class="menububble__button"
							@click="showLinkMenu(marks.link)"
							:class="{ 'is-active': marks.link.active() }"
						>
							<span>Add Link</span>
							<icon name="link" />
						</button>
					</template>

				</template>
			</div>
			<div class="editor__content" slot="content" slot-scope="props">
				<h2>
					Links
				</h2>
				<p>
					Try to add some links to the <a href="https://en.wikipedia.org/wiki/World_Wide_Web">world wide web</a>. By default every link will get a <code>rel="noopener noreferrer nofollow"</code> attribute.
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
				new OrderedListNode(),
				new TodoItemNode(),
				new TodoListNode(),
				new BoldMark(),
				new CodeMark(),
				new ItalicMark(),
				new LinkMark(),
				new HistoryExtension(),
			],
			linkUrl: null,
			linkMenuIsActive: false,
		}
	},
	methods: {
		showLinkMenu(type) {
			this.linkUrl = type.attrs.href
			this.linkMenuIsActive = true
			this.$nextTick(() => {
				this.$refs.linkInput.focus()
			})
		},
		hideLinkMenu() {
			this.linkUrl = null
			this.linkMenuIsActive = false
		},
		setLinkUrl(url, type, focus) {
			type.command({ href: url })
			this.hideLinkMenu()
			focus()
		},
	},
}
</script>