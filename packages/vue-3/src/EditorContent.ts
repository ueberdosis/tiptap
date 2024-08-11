import {
  defineComponent,
  getCurrentInstance,
  h,
  nextTick,
  onBeforeUnmount,
  PropType,
  Ref,
  ref,
  unref,
  watchEffect,
} from 'vue'

import { Editor } from './Editor.js'

export const EditorContent = defineComponent({
  name: 'EditorContent',

  props: {
    editor: {
      default: null,
      type: Object as PropType<Editor>,
    },
  },

  setup(props) {
    const rootEl: Ref<Element | undefined> = ref()
    const instance = getCurrentInstance()

    watchEffect(() => {
      const editor = props.editor

      if (editor && editor.options.element && rootEl.value) {
        nextTick(() => {
          if (!rootEl.value || !editor.options.element.firstChild) {
            return
          }

          const element = unref(rootEl.value)

          rootEl.value.append(...editor.options.element.childNodes)

          // @ts-ignore
          editor.contentComponent = instance.ctx._

          if (instance) {
            editor.appContext = {
              ...instance.appContext,
              // Vue internally uses prototype chain to forward/shadow injects across the entire component chain
              // so don't use object spread operator or 'Object.assign' and just set `provides` as is on editor's appContext
              // @ts-expect-error forward instance's 'provides' into appContext
              provides: instance.provides,
            }
          }

          editor.setOptions({
            element,
          })

          editor.createNodeViews()
        })
      }
    })

    onBeforeUnmount(() => {
      const editor = props.editor

      if (!editor) {
        return
      }

      // destroy nodeviews before vue removes dom element
      if (!editor.isDestroyed) {
        editor.view.setProps({
          nodeViews: {},
        })
      }

      editor.contentComponent = null
      editor.appContext = null

      if (!editor.options.element.firstChild) {
        return
      }

      const newElement = document.createElement('div')

      newElement.append(...editor.options.element.childNodes)

      editor.setOptions({
        element: newElement,
      })
    })

    return { rootEl }
  },

  render() {
    return h(
      'div',
      {
        ref: (el: any) => { this.rootEl = el },
      },
    )
  },
})
