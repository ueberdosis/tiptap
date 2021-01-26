<template>
  <div>
    <editor-content :editor="editor" />

    <div :class="{'character-limit': true, 'character-limit--warning': characters === limit}">
      {{ characters }}/{{ limit }} characters
    </div>
  </div>
</template>

<script>
import tippy from 'tippy.js'
import { Editor, EditorContent, VueRenderer } from '@tiptap/vue'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import CharacterCount from '@tiptap/extension-character-count'
import Mention from '@tiptap/extension-mention'
import MentionList from './MentionList'

export default {
  components: {
    EditorContent,
  },

  data() {
    return {
      editor: null,
      limit: 280,
    }
  },

  mounted() {
    this.editor = new Editor({
      extensions: [
        Document,
        Paragraph,
        Text,
        CharacterCount.configure({
          limit: this.limit,
        }),
        Mention.configure({
          HTMLAttributes: {
            class: 'mention',
          },
          suggestion: {
            items: query => {
              return [
                'Lea Thompson', 'Cyndi Lauper', 'Tom Cruise', 'Madonna', 'Jerry Hall', 'Joan Collins', 'Winona Ryder', 'Christina Applegate', 'Alyssa Milano', 'Molly Ringwald', 'Ally Sheedy', 'Debbie Harry', 'Olivia Newton-John', 'Elton John', 'Michael J. Fox', 'Axl Rose', 'Emilio Estevez', 'Ralph Macchio', 'Rob Lowe', 'Jennifer Grey', 'Mickey Rourke', 'John Cusack', 'Matthew Broderick', 'Justine Bateman', 'Lisa Bonet',
              ].filter(item => item.toLowerCase().startsWith(query.toLowerCase())).slice(0, 10)
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
                    getReferenceClientRect: props.clientRect,
                    appendTo: () => document.body,
                    content: component.element,
                    showOnCreate: true,
                    interactive: true,
                    trigger: 'manual',
                    placement: 'bottom-start',
                  })
                },
                onUpdate(props) {
                  component.updateProps(props)

                  popup[0].setProps({
                    getReferenceClientRect: props.clientRect,
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
        <p>
          What do you all think about the new <span data-mention="Winona Ryder"></span> movie?
        </p>
      `,
    })
  },

  computed: {
    characters() {
      if (this.editor) {
        return this.editor.state.doc.content.size - 2
      }

      return null
    },
  },

  beforeDestroy() {
    this.editor.destroy()
  },
}
</script>

<style lang="scss">
/* Basic editor styles */
.ProseMirror {
  > * + * {
    margin-top: 0.75em;
  }
}

.mention {
  color: #A975FF;
  background-color: rgba(#A975FF, 0.1);
  border-radius: 0.3rem;
  padding: 0.1rem 0.3rem;
}

.character-limit {
  margin-top: 1rem;
  color: #868e96;

  &--warning {
    color: #f03e3e;
  }
}
</style>
