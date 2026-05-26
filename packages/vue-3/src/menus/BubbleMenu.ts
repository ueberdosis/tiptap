import type { BubbleMenuPluginProps } from '@tiptap/extension-bubble-menu'
import { BubbleMenuPlugin } from '@tiptap/extension-bubble-menu'
import { PluginKey } from '@tiptap/pm/state'
import type { PropType } from 'vue'
import { defineComponent, h, onBeforeUnmount, onMounted, Teleport, watchEffect } from 'vue'

export const BubbleMenu = defineComponent({
  name: 'BubbleMenu',

  inheritAttrs: false,

  props: {
    pluginKey: {
      type: [String, Object] as PropType<BubbleMenuPluginProps['pluginKey']>,
      default: undefined,
    },

    editor: {
      type: Object as PropType<BubbleMenuPluginProps['editor']>,
      required: true,
    },

    updateDelay: {
      type: Number as PropType<BubbleMenuPluginProps['updateDelay']>,
      default: undefined,
    },

    resizeDelay: {
      type: Number as PropType<BubbleMenuPluginProps['resizeDelay']>,
      default: undefined,
    },

    options: {
      type: Object as PropType<BubbleMenuPluginProps['options']>,
      default: () => ({}),
    },

    appendTo: {
      type: [Object, Function] as PropType<BubbleMenuPluginProps['appendTo']>,
      default: undefined,
    },

    shouldShow: {
      type: Function as PropType<Exclude<Required<BubbleMenuPluginProps>['shouldShow'], null>>,
      default: null,
    },

    getReferencedVirtualElement: {
      type: Function as PropType<
        Exclude<Required<BubbleMenuPluginProps>['getReferencedVirtualElement'], null>
      >,
      default: undefined,
    },
  },

  setup(props, { slots, attrs }) {
    const resolvedPluginKey = props.pluginKey ?? new PluginKey('bubbleMenu')

    // Create the element imperatively, outside Vue's virtual DOM tree.
    // This prevents Vue's vnode reconciliation from conflicting with the
    // plugin's DOM management (show/hide re-parents the element).
    const menuElement = document.createElement('div')

    // Reactively forward HTML attributes (class, style, data-*, etc.) from
    // the component to the imperatively created menu element.
    // This preserves the attribute forwarding that was previously done via
    // spreading `...attrs` onto the Vue-managed root element.
    watchEffect(() => {
      Object.entries(attrs).forEach(([key, value]) => {
        if (key === 'class') {
          menuElement.className = String(value)
        } else if (key === 'style') {
          if (typeof value === 'string') {
            menuElement.style.cssText = value
          } else if (typeof value === 'object' && value !== null) {
            Object.assign(menuElement.style, value)
          }
        } else if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
          menuElement.setAttribute(key, String(value))
        }
      })
    })

    onMounted(() => {
      const {
        editor,
        options,
        resizeDelay,
        appendTo,
        shouldShow,
        getReferencedVirtualElement,
        updateDelay,
      } = props

      menuElement.style.visibility = 'hidden'
      menuElement.style.position = 'absolute'

      // The element starts detached — no need to remove it from the DOM.
      // The plugin appends it to the editor's parent when the menu should show.
      editor.registerPlugin(
        BubbleMenuPlugin({
          editor,
          element: menuElement,
          options,
          pluginKey: resolvedPluginKey,
          resizeDelay,
          appendTo,
          shouldShow,
          getReferencedVirtualElement,
          updateDelay,
        }),
      )
    })

    onBeforeUnmount(() => {
      const { editor } = props

      editor.unregisterPlugin(resolvedPluginKey)

      // Remove the element from the DOM in case the plugin hasn't already done so
      menuElement.remove()
    })

    // Use Teleport to render slot content into the plugin-managed element.
    // The plugin controls where menuElement lives in the DOM (show/hide),
    // while Vue handles the reactivity of the slot content via Teleport.
    return () => h(Teleport as any, { to: menuElement }, slots.default?.())
  },
})
