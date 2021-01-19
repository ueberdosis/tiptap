<template>
  <div v-if="editor">
    <editor-content :editor="editor" />
  </div>
</template>

<script>
import tippy from 'tippy.js'
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
          HTMLAttributes: {
            class: 'mention',
          },
          suggestionOptions: {
            items: query => {
              return ['Hans', 'Philipp', 'Kris'].filter(item => item.startsWith(query))
            },
            render: () => {
              let component
              let popup

              return {
                onStart: props => {
                  component = new VueRenderer(MentionList, {
                    parent: this,
                    propsData: props,
                  })

                  popup = tippy('body', {
                    getReferenceClientRect: () => props.clientRect,
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

                  popup[0].setProps({
                    getReferenceClientRect: () => props.clientRect,
                  })
                },
                onKeyDown(props) {
                  return component.vm.onKeyDown(props)
                },
                onExit() {
                  popup[0].destroy()
                  component.destroy()
                },
              }
            },
          },
        }),
      ],
      content: `
        <p>Hello <span data-mention="Hans"></span> and <span data-mention="Philipp"></span> and <span data-mention="Kris"></span>!</p>
      `,
    })
  },

  beforeDestroy() {
    this.editor.destroy()
  },
}
</script>

<style lang="scss">
.mention {
  color: #A975FF;
  background-color: rgba(#A975FF, 0.1);
  border-radius: 0.3rem;
  padding: 0.1rem 0.3rem;
}
</style>
