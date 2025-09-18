import type { Component, CreateElement, PropType } from 'vue'
import type Vue from 'vue'

import type { Editor } from './Editor.js'

export interface EditorContentInterface extends Vue {
  editor: Editor
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

            if (!element || !editor.view.dom?.firstChild) {
              return
            }

            element.append(editor.view.dom)
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

  render(createElement: CreateElement) {
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

    if (!editor.view.dom?.firstChild) {
      return
    }

    // TODO using the new editor.mount method might allow us to remove this
    const newElement = document.createElement('div')

    newElement.append(editor.view.dom)

    editor.setOptions({
      element: newElement,
    })
  },
}
