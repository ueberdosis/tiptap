<template>
	<div>
		<editor :editable="true" class="editor" @update="onUpdate">
			<div class="menubar" :class="{ 'is-focused': focused }" slot="menubar" slot-scope="{ nodes, marks, focused }">
				<div v-if="nodes && marks">
          <button class="menubar__button" @click="marks.bold.command" :class="{ 'is-active': marks.bold.active() }">
            <icon name="bold" />
          </button>
          <button class="menubar__button" @click="marks.italic.command" :class="{ 'is-active': marks.italic.active() }">
            <icon name="italic" />
          </button>
          <button class="menubar__button" @click="marks.code.command" :class="{ 'is-active': marks.code.active() }">
            <icon name="code" />
          </button>
					<button class="menubar__button" @click="nodes.paragraph.command" :class="{ 'is-active': nodes.paragraph.active() }">
						<icon name="paragraph" />
					</button>
					<button class="menubar__button" @click="nodes.heading.command({ level: 1 })" :class="{ 'is-active': nodes.heading.active({ level: 1 }) }">
						H1
					</button>
					<button class="menubar__button" @click="nodes.heading.command({ level: 2 })" :class="{ 'is-active': nodes.heading.active({ level: 2 }) }">
						H2
					</button>
					<button class="menubar__button" @click="nodes.heading.command({ level: 3 })" :class="{ 'is-active': nodes.heading.active({ level: 3 }) }">
						H3
					</button>
					<button class="menubar__button" @click="nodes.bullet_list.command" :class="{ 'is-active': nodes.bullet_list.active() }">
						<icon name="ul" />
					</button>
					<button class="menubar__button" @click="nodes.ordered_list.command" :class="{ 'is-active': nodes.ordered_list.active() }">
						<icon name="ol" />
					</button>
					<button class="menubar__button" @click="nodes.code_block.command" :class="{ 'is-active': nodes.code_block.active() }">
						<icon name="code" />
					</button>
				</div>
			</div>
			<div class="editor__content" slot="content" slot-scope="props">
        <h1>
          A renderless rich-text editor for Vue.js
        </h1>
        <p>
          This editor is based on <a href="https://prosemirror.net">Prosemirror</a>, <em>fully extendable</em> and renderless. There is a plugin system that lets you render each node as <strong>a vue component</strong>.
        </p>
        <pre><code>body { display: none; }</code></pre>
        <ul>
          <li>
            A regular list
          </li>
          <li>
            With regular items
          </li>
        </ul>
        <p>
          It's amazing 👏
        </p>
      </div>
		</editor>
	</div>
</template>

<script>
import Icon from 'Components/Icon'
import { Editor } from 'tiptap'

export default {
  components: {
    Editor,
    Icon,
  },
  methods: {
    onUpdate(state) {
      this.data = state.doc.toJSON()
    },
  },
}
</script>