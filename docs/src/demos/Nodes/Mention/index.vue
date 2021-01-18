<template>
  <div v-if="editor">
    <editor-content :editor="editor" />
  </div>
</template>

<script>
import tippy, { sticky } from 'tippy.js'
import { Editor, EditorContent, VueRenderer } from '@tiptap/vue'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Mention from '@tiptap/extension-mention'
import MentionList from './MentionList'

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
            return ['foo', 'bar'].filter(item => item.startsWith(query))
          },
          renderer: () => {
            let component
            let popup

            return {
              onStart: props => {
                component = new VueRenderer(MentionList, {
                  parent: this,
                  propsData: props,
                })

                popup = tippy('body', {
                  getReferenceClientRect: () => props.virtualNode.getBoundingClientRect(),
                  appendTo: () => document.body,
                  content: component.element,
                  showOnCreate: true,
                  interactive: true,
                  trigger: 'manual',
                  placement: 'top-start',
                })
              },
              onUpdate(props) {
                component.updateProps(props)
              },
              onExit() {
                popup[0].destroy()
                component.destroy()
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
