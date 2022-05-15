import Vue, { PropType, Component } from 'vue'
import { Editor } from './Editor'

export interface EditorContentInterface extends Vue {
  editor: Editor,
}

export const EditorContent: Component = {
  name: 'EditorContent',

  props: {
    editor: {
      default: null,
      type: Object as PropType<Editor>,
    },
  },

  watch: {
    editor: {
      immediate: true,
      handler(this: EditorContentInterface, editor: Editor) {
        if (editor && editor.view.dom) {
          this.$nextTick(() => {
            const element = this.$el
            const parentElement = editor.view.dom.parentElement

            if (parentElement) {
              element.append(...parentElement.childNodes)
            }

            editor.contentComponent = this

            editor.setOptions({
              element,
            })

            editor.createNodeViews()
          })
        }
      },
    },
  },

  render(createElement) {
    return createElement('div')
  },

  beforeDestroy(this: EditorContentInterface) {
    const { editor } = this

    if (!editor) {
      return
    }

    if (!editor.isDestroyed) {
      editor.view.setProps({
        nodeViews: {},
      })
    }

    editor.contentComponent = null

    if (!editor.view.dom) {
      return
    }

    const element = document.createElement('div')
    const parentElement = editor.view.dom.parentElement
    
    if (parentElement) {
      element.append(...parentElement.childNodes)
    }

    editor.setOptions({
      element,
    })
  },
}
