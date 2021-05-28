import {
  h,
  ref,
  Ref,
  unref,
  Teleport,
  PropType,
  defineComponent,
  DefineComponent,
  watchEffect,
  nextTick,
  onBeforeUnmount,
  getCurrentInstance,
} from 'vue'
import { Editor } from './Editor'

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
    const vueRenderers: any[] = []

    if (this.editor) {
      this.editor.vueRenderers.forEach(vueRenderer => {
        const node = h(
          Teleport,
          {
            to: vueRenderer.teleportElement,
            key: vueRenderer.id,
          },
          h(
            vueRenderer.component as DefineComponent,
            {
              ref: vueRenderer.id,
              ...vueRenderer.props,
            },
          ),
        )

        vueRenderers.push(node)
      })
    }

    return h(
      'div',
      {
        ref: (el: any) => { this.rootEl = el },
      },
      ...vueRenderers,
    )
  },
})
