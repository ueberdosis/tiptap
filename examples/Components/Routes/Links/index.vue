<template>
	<div class="editor">
		<menu-bubble class="menububble" :editor="editor">
			<template slot-scope="{ nodes, marks }">

				<form class="menububble__form" v-if="linkMenuIsActive" @submit.prevent="setLinkUrl(linkUrl, marks.link)">
					<input class="menububble__input" type="text" v-model="linkUrl" placeholder="https://" ref="linkInput" @keydown.esc="hideLinkMenu"/>
					<button class="menububble__button" @click="setLinkUrl(null, marks.link)" type="button">
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
		</menu-bubble>

		<editor-content class="editor__content" :editor="editor" />
	</div>
</template>

<script>
import Icon from 'Components/Icon'
import { Editor, EditorContent, MenuBubble } from 'tiptap'
import {
	Blockquote,
	BulletList,
	CodeBlock,
	HardBreak,
	Heading,
	ListItem,
	OrderedList,
	TodoItem,
	TodoList,
	Bold,
	Code,
	Italic,
	Link,
	History,
} from 'tiptap-extensions'

export default {
	components: {
		EditorContent,
		MenuBubble,
		Icon,
	},
	data() {
		return {
			editor: new Editor({
				extensions: [
					new Blockquote(),
					new BulletList(),
					new CodeBlock(),
					new HardBreak(),
					new Heading({ levels: [1, 2, 3] }),
					new ListItem(),
					new OrderedList(),
					new TodoItem(),
					new TodoList(),
					new Bold(),
					new Code(),
					new Italic(),
					new Link(),
					new History(),
				],
				content: `
					<h2>
						Links
					</h2>
					<p>
						Try to add some links to the <a href="https://en.wikipedia.org/wiki/World_Wide_Web">world wide web</a>. By default every link will get a <code>rel="noopener noreferrer nofollow"</code> attribute.
					</p>
				`,
			}),
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
			this.editor.focus()
		},
	},
}
</script>