<template>
  <div v-if="editor" class="col-group">
    <div class="main">
      <editor-content :editor="editor" />
    </div>
    <div class="sidebar">
      <div class="sidebar-options">
        <div class="label-small">Levels</div>
        <div class="button-group">
          <button
            v-for="level in allLevels"
            :key="level"
            :class="{ 'is-active': levels.includes(level) }"
            @click="toggleLevel(level)"
          >
            H{{ level }}
          </button>
        </div>
        <div class="label-small">Depth</div>
        <div class="button-group">
          <button
            v-for="choice in depthChoices"
            :key="choice.label"
            :class="{ 'is-active': maxDepth === choice.value }"
            @click="maxDepth = choice.value"
          >
            {{ choice.label }}
          </button>
        </div>
        <div class="label-large">Outline</div>
        <Outline :rows="rows" @select="goToHeading" />
      </div>
    </div>
  </div>
</template>

<script>
import {
  filterTableOfContents,
  resolveTableOfContents,
  TableOfContents,
} from '@tiptap/extension-table-of-contents'
import { TextSelection } from '@tiptap/pm/state'
import StarterKit from '@tiptap/starter-kit'
import { Editor, EditorContent } from '@tiptap/vue'
import { defineComponent } from 'vue'

import '../styles.scss'

import { content } from '../content.js'
import Outline from './Outline.vue'

export default defineComponent({
  components: {
    EditorContent,
    Outline,
  },

  data() {
    return {
      editor: null,
      headings: [],
      allLevels: [2, 3, 4],
      depthChoices: [
        { label: 'All', value: undefined },
        { label: '1', value: 1 },
        { label: '2', value: 2 },
      ],
      levels: [2, 3, 4],
      maxDepth: undefined,
    }
  },

  computed: {
    rows() {
      return filterTableOfContents(this.headings, { levels: this.levels, maxDepth: this.maxDepth })
    },
  },

  mounted() {
    this.editor = new Editor({
      extensions: [StarterKit, TableOfContents.configure({ updateOnTransaction: false })],
      content,
      onCreate: ({ editor }) => {
        this.headings = resolveTableOfContents(editor.state.doc)
      },
      onUpdate: ({ editor }) => {
        this.headings = resolveTableOfContents(editor.state.doc)
      },
    })
  },

  beforeUnmount() {
    this.editor.destroy()
  },

  methods: {
    toggleLevel(level) {
      this.levels = this.levels.includes(level)
        ? this.levels.filter(item => item !== level)
        : [...this.levels, level].sort((left, right) => left - right)
    },

    goToHeading(heading) {
      const { tr } = this.editor.state

      tr.setSelection(TextSelection.near(tr.doc.resolve(heading.pos + 1)))
      tr.scrollIntoView()
      this.editor.view.dispatch(tr)
      this.editor.view.focus()
    },
  },
})
</script>
