<template>
  <div v-if="editor">
    <editor-content :editor="editor" />
  </div>
</template>

<script>
import tippy from 'tippy.js'
import { Editor, EditorContent, VueRenderer } from '@tiptap/vue-2'
import StarterKit from '@tiptap/starter-kit'
import Commands from './commands'
import CommandsList from './CommandsList'

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
        StarterKit,
        Commands.configure({
          suggestion: {
            items: query => {
              return [
                {
                  title: 'H1',
                  command: ({ editor, range }) => {
                    editor
                      .chain()
                      .focus()
                      .deleteRange(range)
                      .setNode('heading', { level: 1 })
                      .run()
                  },
                },
                {
                  title: 'H2',
                  command: ({ editor, range }) => {
                    editor
                      .chain()
                      .focus()
                      .deleteRange(range)
                      .setNode('heading', { level: 2 })
                      .run()
                  },
                },
                {
                  title: 'bold',
                  command: ({ editor, range }) => {
                    editor
                      .chain()
                      .focus()
                      .deleteRange(range)
                      .setMark('bold')
                      .run()
                  },
                },
                {
                  title: 'italic',
                  command: ({ editor, range }) => {
                    editor
                      .chain()
                      .focus()
                      .deleteRange(range)
                      .setMark('italic')
                      .run()
                  },
                },
              ].filter(item => item.title.toLowerCase().startsWith(query.toLowerCase())).slice(0, 10)
            },
            render: () => {
              let component
              let popup

              return {
                onStart: props => {
                  component = new VueRenderer(CommandsList, {
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
                  if (props.event.key === 'Escape') {
                    popup[0].hide()

                    return true
                  }

                  return component.ref?.onKeyDown(props)
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
        <p>Type a slash</p>
        <p></p>
        <p></p>
      `,
    })
  },

  beforeDestroy() {
    this.editor.destroy()
  },
}
</script>

<style lang="scss" scoped>
::v-deep {
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
}
</style>
