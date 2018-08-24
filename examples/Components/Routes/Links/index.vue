<template>
	<div>
		<editor class="editor" :extensions="extensions" @update="onUpdate">
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
					Try to add some links to the <a href="https://en.wikipedia.org/wiki/World_Wide_Web">world wide web</a>.
				</p>
			</div>
		</editor>
	</div>
</template>

<script>
import Icon from 'Components/Icon'
import { Editor } from 'tiptap'
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
} from 'tiptap-extensions'

export default {
	components: {
		Editor,
		Icon,
	},
	data() {
		return {
			extensions: [
				new Blockquote(),
				new BulletList(),
				new CodeBlock(),
				new HardBreak(),
				new Heading({ maxLevel: 3 }),
				new ListItem(),
				new OrderedList(),
				new TodoItem(),
				new TodoList(),
				new Bold(),
				new Code(),
				new Italic(),
				new Link(),
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
		onUpdate(state) {
			// console.log(state.doc.toJSON())
		},
	},
}
</script>