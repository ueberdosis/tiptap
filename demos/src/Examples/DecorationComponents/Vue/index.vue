<template>
  <div v-if="editor">
    <editor-content :editor="editor" />
  </div>
</template>

<script>
import '../styles.scss'

import { Extension } from '@tiptap/core'
import UniqueID from '@tiptap/extension-unique-id'
import StarterKit from '@tiptap/starter-kit'
import { Editor, EditorContent, VueWidgetRenderer } from '@tiptap/vue-3'

import Counter from './Counter.vue'

/**
 * Renders an interactive Vue `Counter` widget at the end of every paragraph
 * using the declarative Decorations API + `VueWidgetRenderer`.
 *
 * Widgets are keyed by the paragraph's stable `id` (assigned by `UniqueID`), not
 * by its index. That is what lets the counter keep its value when you type,
 * insert, or reorder paragraphs — ProseMirror reuses the same component instance
 * because the key is stable. An index-based key would churn on every structural
 * change and remount the component, losing its state.
 */
const ParagraphCounters = Extension.create({
  name: 'paragraphCounters',

  addDecorations() {
    return {
      create: ({ editor, state }) => {
        const decorations = []
        let index = 0

        state.doc.forEach((node, offset) => {
          if (node.type.name !== 'paragraph') {
            return
          }

          const currentIndex = index

          decorations.push(
            VueWidgetRenderer(Counter, {
              editor,
              pos: offset + node.nodeSize - 1,
              // Stable domain key: the paragraph's id, not its position/index.
              key: `paragraph-counter-${node.attrs.id}`,
              props: { index: currentIndex },
              side: 1,
            }),
          )

          index += 1
        })

        return decorations
      },
    }
  },
})

export default {
  components: {
    EditorContent,
  },

  data() {
    return {
      editor: null,
    }
  },

  mounted() {
    this.editor = new Editor({
      extensions: [StarterKit, UniqueID.configure({ types: ['paragraph'] }), ParagraphCounters],
      content: `
        <h2>Decoration components</h2>
        <p>Each paragraph gets an interactive Vue widget. Click a counter, then type in this paragraph — the count survives because the widget instance is reused, not remounted.</p>
        <p>This second paragraph has its own independent counter. Add or remove paragraphs to see the indexes update.</p>
      `,
    })
  },

  unmounted() {
    this.editor.destroy()
  },
}
</script>
