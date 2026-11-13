import type { DefineComponent, HTMLAttributes, PropType, Ref } from 'vue'
import { defineComponent, getCurrentInstance, h, nextTick, ref, watch } from 'vue'

import type { Editor } from './Editor.js'

export type EditorContentProps = {
  /**
   * The editor instance to render into this element.
   */
  editor?: Editor | null
} & HTMLAttributes

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

    watch(
      [() => props.editor, rootEl],
      ([editor, element], _previous, onCleanup) => {
        if (!editor || !element || editor.isDestroyed) {
          return
        }

        let cancelled = false

        onCleanup(() => {
          cancelled = true
          editor.unmount()
          editor.contentComponent = null
          editor.appContext = null
        })

        nextTick(() => {
          if (cancelled || editor.isDestroyed) {
            return
          }

          editor.unmount()
          // @ts-ignore
          editor.contentComponent = instance.ctx._

          if (instance) {
            editor.appContext = {
              ...instance.appContext,
              // @ts-expect-error Vue forwards provides through the instance.
              provides: instance.provides,
            }
          }

          editor.mount(element)
        })
      },
      { immediate: true },
    )

    return { rootEl }
  },

  render() {
    return h('div', {
      ref: (el: any) => {
        this.rootEl = el
      },
    })
  },
  // Native attributes fall through to the root <div> at runtime; expose them
  // on the public props type so vue-tsc strictTemplates accepts them (#8658).
}) as DefineComponent<EditorContentProps, { rootEl: Ref<Element | undefined> }>
