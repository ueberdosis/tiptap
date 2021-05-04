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
        if (editor && editor.options.element) {
          this.$nextTick(() => {
            const element = this.$el

            if (!element || !editor.options.element.firstChild) {
              return
            }

            element.appendChild(editor.options.element.firstChild)
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

    if (!editor.isDestroyed) {
      editor.view.setProps({
        nodeViews: {},
      })
    }

    editor.contentComponent = null

    if (!editor.options.element.firstChild) {
      return
    }

    const newElement = document.createElement('div')

    newElement.appendChild(editor.options.element.firstChild)

    editor.setOptions({
      element: newElement,
    })
  },
}
