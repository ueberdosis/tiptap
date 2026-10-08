import type { PropType, Ref } from 'vue'
import {
  defineComponent,
  getCurrentInstance,
  h,
  nextTick,
  onBeforeUnmount,
  ref,
  unref,
  watchEffect,
} from 'vue'

import type { Editor } from './Editor.js'

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
    let mountedEditor: Editor | null = null

    watchEffect(() => {
      const editor = props.editor

      if (editor && editor.options.element && rootEl.value) {
        nextTick(() => {
          if (!rootEl.value || !editor.view.dom?.parentNode) {
            return
          }

          // TODO using the new editor.mount method might allow us to remove this
          const element = unref(rootEl.value)

          // When the editor is replaced, move the previous editor's view out of the element,
          // otherwise the new view is added next to it instead of replacing it
          if (mountedEditor && mountedEditor !== editor && !mountedEditor.isDestroyed) {
            const previousElement = document.createElement('div')

            previousElement.append(...rootEl.value.childNodes)

            mountedEditor.contentComponent = null
            mountedEditor.appContext = null
            mountedEditor.setOptions({
              element: previousElement,
            })
          }

          rootEl.value.append(...editor.view.dom.parentNode.childNodes)
          mountedEditor = editor

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

      editor.contentComponent = null
      editor.appContext = null
    })

    return { rootEl }
  },

  render() {
    return h('div', {
      ref: (el: any) => {
        this.rootEl = el
      },
    })
  },
})
