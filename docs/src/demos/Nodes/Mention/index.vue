<template>
  <div v-if="editor">
    <editor-content :editor="editor" />
  </div>
</template>

<script>
import Vue from 'vue'
import tippy, { sticky } from 'tippy.js'
import { Editor } from '@tiptap/core'
import { EditorContent } from '@tiptap/vue'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Mention from '@tiptap/extension-mention'

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
      extensions: [
        Document,
        Paragraph,
        Text,
        Mention.configure({
          items: query => {
            console.log('items', query)

            return [query]
          },
          renderer: () => {
            let popup
            const Component = new (Vue.extend({
              template: '<div>YAAAAY</div>',
            }))().$mount()

            return {
              onStart(props) {
                console.log('start')

                popup = tippy('.app', {
                  getReferenceClientRect: () => props.virtualNode.getBoundingClientRect(),
                  appendTo: () => document.body,
                  interactive: true,
                  sticky: true, // make sure position of tippy is updated when content changes
                  plugins: [sticky],
                  content: Component.$el,
                  trigger: 'mouseenter', // manual
                  showOnCreate: true,
                  theme: 'dark',
                  placement: 'top-start',
                  inertia: true,
                  duration: [400, 200],
                })

              },
              onUpdate(props) {
                console.log('update', props)
              },
              onExit(props) {
                console.log('exit', props)

                if (popup) {
                  popup[0].destroy()
                }

                Component.$destroy()
              },
            }
          },
        }),
      ],
      content: `
        <p>text <span data-mention></span></p>
      `,
    })
  },

  beforeDestroy() {
    this.editor.destroy()
  },
}
</script>
